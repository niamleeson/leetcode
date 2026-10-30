// Cross-check original, unmodified solutions using V8 breakpoints on a separate thread.
const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');
const assert = require('node:assert/strict');

if(!isMainThread) {
  const {Session}=require('node:inspector/promises');
  (async()=>{
    const session=new Session();session.connectToMainThread();
    const values=[],errors=[];
    session.on('Debugger.paused',async({params})=>{
      try {
        const frame=params.callFrames[0];
        assert.equal(frame.location.lineNumber,workerData.line-1,'V8 breakpoint moved to another source line');
        const response=await session.post('Debugger.evaluateOnCallFrame',{
          callFrameId:frame.callFrameId,
          expression:`JSON.stringify((${workerData.expression}),(_key,value)=>typeof value==='number'&&!Number.isFinite(value)?String(value):value)`,
          returnByValue:true,
        });
        if(response.exceptionDetails)throw new Error(response.exceptionDetails.text+': '+response.result.description);
        values.push(JSON.parse(response.result.value));
      }catch(error){errors.push(error.message);}
      finally{await session.post('Debugger.resume');}
    });
    parentPort.on('message',async message=>{
      if(message==='done'){await session.post('Debugger.disable');session.disconnect();parentPort.postMessage({values,errors});parentPort.close();}
    });
    await session.post('Debugger.enable');
    await session.post('Debugger.setBreakpointByUrl',{url:workerData.url,lineNumber:workerData.line-1});
    parentPort.postMessage('ready');
  })().catch(error=>{parentPort.postMessage({error:error.stack});process.exitCode=1;});
} else {
  const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
  const {root,walkthroughs}=require('./load.cjs');
  const fixtures=require('./fixtures.json');
  const {setup,invocation}=require('./runtime.cjs');
  const {evaluate}=require('./audit-recordings.cjs');
  const specs=[
    {id:150,anchor:'const rightOperand = stack.pop();',kind:'operation',expression:'({stack:stack.slice(),token})'},
    {id:3,anchor:'charSet.add(newChar);',kind:'operation',expression:'({left,right,newChar,maxLen,chars:[...charSet]})'},
    {id:102,anchor:'result.push(currentLevel);',kind:'operation',expression:'({queue:queue.map(n=>n.val),currentLevel,result,levelSize})'},
    {id:994,anchor:'queue.push([neighborRow, neighborCol]);',kind:'operation',expression:'({grid,queue,freshCount,neighborRow,neighborCol,r,c})'},
    {id:133,anchor:'copy.neighbors.push(clonedNeighbor);',kind:'operation',expression:'({original:original.val,copy:copy.val,neighbors:copy.neighbors.map(n=>n.val),neighbor:neighbor.val,clonedNeighbor:clonedNeighbor.val,cloned:[...cloned.keys()].map(n=>n.val)})'},
    {id:207,anchor:'queue.push(dependentCourse);',kind:'operation',expression:'({queue,inDegree,course,dependentCourse,processedCount})'},
    {id:322,anchor:'dp[a] = Math.min(dp[a], candidate);',kind:'statement',expression:'({dp,a,coin,candidate,remainder})'},
    {id:215,anchor:'let smaller = left;',kind:'statement',expression:'({nums,k,left,right,pivot,target})'},
    {id:200,anchor:'grid[r][c] = "0";',kind:'statement',expression:'({grid,r,c})'},
    {id:200,variant:'iterative',anchor:'[r, c] = stack.pop();',kind:'operation',expression:'({grid,stack,r,c})'},
    {id:200,variant:'iterative',anchor:'stack.push([nr, nc]);',kind:'operation',expression:'({grid,stack,r,c,nr,nc})'},
    {id:695,variant:'iterative',anchor:'area++;',kind:'statement',expression:'({grid,stack,r,c,area})'},
    {id:695,variant:'iterative',anchor:'maxArea = Math.max(maxArea, area);',kind:'statement',expression:'({grid,r,c,area,maxArea})'},
    {id:130,variant:'iterative',anchor:'stack.push([nr, nc]);',kind:'operation',expression:'({board,stack,r,c,nr,nc})'},
    {id:133,variant:'iterative',anchor:'copy.neighbors.push(cloned.get(neighbor));',kind:'operation',expression:'({original:original.val,copy:copy.val,neighbors:copy.neighbors.map(n=>n.val),neighbor:neighbor.val,cloned:[...cloned.keys()].map(n=>n.val),stack:stack.map(n=>n.val)})'},
    {id:332,variant:'iterative',anchor:'const finishedAirport = stack.pop();',kind:'operation',expression:'({stack,route,airport,destinations})'},
  ];
  const normalize=value=>JSON.parse(JSON.stringify(value,(_key,v)=>typeof v==='number'&&!Number.isFinite(v)?String(v):v));
  const message=worker=>new Promise((resolve,reject)=>{
    const onExit=code=>reject(new Error(`Debugger worker exited before reporting (${code})`));
    worker.once('exit',onExit);worker.once('error',reject);
    worker.once('message',value=>{worker.removeListener('exit',onExit);resolve(value);});
  });
  (async()=>{
    let comparisons=0,cases=0;
    for(const spec of specs) {
      const key=spec.variant?`${spec.id}-${spec.variant}`:String(spec.id);
      const source=walkthroughs.find(entry=>entry.key===key).solution.jsCode;
      const line=source.split('\n').findIndex(text=>text.trim()===spec.anchor)+1;
      assert(line>0,`Missing source anchor for ${spec.id}`);
      const trace=JSON.parse(fs.readFileSync(path.join(root,'src/data/walkthroughs/generated',`${key}.json`),'utf8'));
      for(const [index,fixture] of fixtures[spec.id].entries()) {
        const expected=[];let heap={},previous;
        for(const step of trace.examples[index].steps) {
          if(step.line===line&&step.kind===spec.kind)expected.push(normalize(evaluate(spec.expression,previous.state,heap)));
          heap={...heap,...step.heap};previous=step;
        }
        const url=`walkthrough-v8-${key}-${line}-${index}.js`;
        const worker=new Worker(__filename,{workerData:{url,line,expression:spec.expression}});
        assert.equal(await message(worker),'ready');
        const context=vm.createContext({__problemId:spec.id,__case:JSON.parse(JSON.stringify(fixture)),__trace:{start(){},stop(){}}});
        new vm.Script(setup).runInContext(context);
        new vm.Script(source,{filename:url}).runInContext(context);
        new vm.Script(invocation(fixture)).runInContext(context,{timeout:15000});
        const resultPromise=message(worker);worker.postMessage('done');
        const result=await resultPromise;
        assert.deepEqual(result.errors,[],`${spec.id}/${index}: debugger errors`);
        assert.deepEqual(result.values,expected,`${spec.id}/${index}: recorded state differs from original V8 execution at line ${line}`);
        cases++;comparisons+=expected.length;
      }
    }
    console.log(`V8 debugger audit: ${comparisons} intermediate snapshots matched across ${cases} cases at ${specs.length} source locations.`);
  })().catch(error=>{console.error(error);process.exitCode=1;});
}
