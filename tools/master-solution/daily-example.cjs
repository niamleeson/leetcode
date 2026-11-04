const input = {
  ledger: [2, -1, 2, 1], targetTotal: 3,
  sortedWeights: [1, 2, 3, 4], pairTarget: 5,
  events: 'ADOBECODEBANC', requiredEvents: 'ABC',
  costExpression: ['2', '1', '+', '3', '*'],
  shipmentWeights: [1, 2, 3, 4, 5], days: 3,
  route: [1, 2, 3],
  management: [1, 2, 3, 4],
  priorities: [4, 1, 7], rank: 2, newPriority: 5,
  boxSizes: [2, 3], packedWeight: 7,
  addresses: ['harbor', 'hill'], addressPrefix: 'ha',
  jobCount: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]],
  cityCount: 3, startCity: 1, roads: [[1, 2, 2], [1, 3, 7], [2, 3, 1]],
  windows: [[1, 3], [2, 4], [6, 8]],
};
const expected = {
  matchingLedgerSegments: 2, pairedWeightIndices: [1, 4],
  shortestCompleteEventSegment: 'BANC', deliveryCost: 9,
  truckCapacity: 6, reversedRoute: [3, 2, 1],
  managementLevels: [[1], [2, 3], [4]], secondHighestPriority: 5,
  boxPlans: [[2, 2, 3]], addressPrefixExists: true,
  jobOrder: [0, 1, 2, 3], alertArrivalTime: 3,
  combinedWindows: [[1, 4], [6, 8]],
};
const stages = [
  ['A13',560,'Count ledger segments with the target total'],
  ['P03',167,'Pair sorted package weights'],
  ['W03',76,'Find the shortest complete event segment'],
  ['S01',150,'Evaluate the delivery cost expression'],
  ['B02',1011,'Choose the smallest feasible truck capacity'],
  ['L01',206,'Reverse the delivery route'],
  ['T06',102,'List the management hierarchy by level'],
  ['H01',703,'Update the second-highest priority'],
  ['R01',39,'Enumerate valid box combinations'],
  ['TR01',208,'Find an address prefix'],
  ['G07',210,'Order delivery jobs by prerequisites'],
  ['D01',743,'Find when every city receives the alert'],
  ['I01',56,'Combine overlapping delivery windows'],
].map(([unit,problemId,task])=>({unit,problemId,task}));
const source = `
// A delivery day exercises one operation from each chapter. Every other audited
// variation remains available through operation(unitId, problemId, variant).
export function runDeliveryDay(input = deliveryDayInput) {
  const day = structuredClone(input);
  const { subarraySum } = operation('A13', 560);
  const { twoSum } = operation('P03', 167);
  const { minWindow } = operation('W03', 76);
  const { evalRPN } = operation('S01', 150);
  const { shipWithinDays } = operation('B02', 1011);
  const { reverseList } = operation('L01', 206);
  const { levelOrder } = operation('T06', 102);
  const { KthLargest } = operation('H01', 703);
  const { combinationSum } = operation('R01', 39);
  const { Trie } = operation('TR01', 208);
  const { findOrder } = operation('G07', 210);
  const { networkDelayTime } = operation('D01', 743);
  const { merge } = operation('I01', 56);

  const priorities = new KthLargest(day.rank, day.priorities);
  const addressBook = new Trie();
  for (const address of day.addresses) addressBook.insert(address);

  return {
    matchingLedgerSegments: subarraySum(day.ledger, day.targetTotal),
    pairedWeightIndices: twoSum(day.sortedWeights, day.pairTarget),
    shortestCompleteEventSegment: minWindow(day.events, day.requiredEvents),
    deliveryCost: evalRPN(day.costExpression),
    truckCapacity: shipWithinDays(day.shipmentWeights, day.days),
    reversedRoute: listValues(reverseList(makeList(day.route))),
    managementLevels: levelOrder(makeTree(day.management)),
    secondHighestPriority: priorities.add(day.newPriority),
    boxPlans: combinationSum(day.boxSizes, day.packedWeight),
    addressPrefixExists: addressBook.startsWith(day.addressPrefix),
    jobOrder: findOrder(day.jobCount, day.prerequisites),
    alertArrivalTime: networkDelayTime(day.roads, day.cityCount, day.startCity),
    combinedWindows: merge(day.windows),
  };
}
`;
module.exports = { input, expected, stages, source };
