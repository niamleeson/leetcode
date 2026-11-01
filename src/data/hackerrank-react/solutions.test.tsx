import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { basicChallenges } from './basic';
import { formChallenges } from './forms';

const challenges = [...basicChallenges, ...formChallenges];

// Execute the exact JSX shown in the solution library, so a broken snippet
// fails these tests even when its explanation or example is still correct.
function loadSolution(slug: string): React.ComponentType<any> {
  const challenge = challenges.find(item => item.slug === slug);
  if (!challenge) throw new Error(`Missing solution: ${slug}`);

  const compiled = ts.transpileModule(challenge.code, {
    fileName: `${slug}.jsx`,
    reportDiagnostics: true,
    compilerOptions: {
      allowJs: true,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const errors = compiled.diagnostics?.filter(item => item.category === ts.DiagnosticCategory.Error) ?? [];
  if (errors.length) {
    throw new Error(errors.map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n'));
  }

  const exports: { default?: React.ComponentType<any> } = {};
  const require = (name: string) => {
    if (name === 'react') return React;
    if (name === 'react/jsx-runtime') return jsxRuntime;
    throw new Error(`Unexpected solution dependency: ${name}`);
  };
  new Function('require', 'exports', compiled.outputText)(require, exports);
  if (!exports.default) throw new Error(`No default React component: ${slug}`);
  return exports.default;
}

function change(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('the published solution snippets', () => {
  it('includes ten unique, standalone React solutions', () => {
    expect(challenges).toHaveLength(10);
    expect(new Set(challenges.map(item => item.slug)).size).toBe(10);
    for (const challenge of challenges) expect(loadSolution(challenge.slug)).toBeTypeOf('function');
  });
});

describe('Item List Manager', () => {
  it('appends in order, permits duplicates, clears the input, and rejects blank entries', () => {
    const Component = loadSolution('item-list-manager');
    render(<Component />);
    const items = screen.getByRole('list', { name: 'Items' });
    const add = screen.getByRole('button', { name: 'Add Item' });
    expect(within(items).queryAllByRole('listitem')).toHaveLength(0);
    fireEvent.click(add);
    change('Item', '   ');
    fireEvent.click(add);
    expect(within(items).queryAllByRole('listitem')).toHaveLength(0);
    for (const value of ['Alpha', 'Beta', 'Alpha']) {
      change('Item', value);
      fireEvent.click(add);
      expect(screen.getByLabelText('Item')).toHaveValue('');
    }
    expect(within(items).getAllByRole('listitem').map(item => item.textContent)).toEqual(['Alpha', 'Beta', 'Alpha']);
  });
});

describe('Code Review Feedback', () => {
  it('keeps all ten counters independent, including opposite votes on one aspect', () => {
    const Component = loadSolution('code-review-feedback');
    render(<Component />);
    const names = ['Readability', 'Performance', 'Security', 'Documentation', 'Testing'];
    for (const name of names) {
      const region = screen.getByRole('region', { name });
      expect(region).toHaveTextContent('Upvotes: 0');
      expect(region).toHaveTextContent('Downvotes: 0');
    }
    fireEvent.click(screen.getByRole('button', { name: 'Upvote Readability' }));
    fireEvent.click(screen.getByRole('button', { name: 'Upvote Readability' }));
    fireEvent.click(screen.getByRole('button', { name: 'Downvote Readability' }));
    fireEvent.click(screen.getByRole('button', { name: 'Downvote Performance' }));
    expect(screen.getByRole('region', { name: 'Readability' })).toHaveTextContent('Upvotes: 2');
    expect(screen.getByRole('region', { name: 'Readability' })).toHaveTextContent('Downvotes: 1');
    expect(screen.getByRole('region', { name: 'Performance' })).toHaveTextContent('Upvotes: 0');
    expect(screen.getByRole('region', { name: 'Performance' })).toHaveTextContent('Downvotes: 1');
    for (const name of names.slice(2)) {
      expect(screen.getByRole('region', { name })).toHaveTextContent('Upvotes: 0');
      expect(screen.getByRole('region', { name })).toHaveTextContent('Downvotes: 0');
    }
  });
});

describe('Article Sorting', () => {
  it('sorts descending by either field without mutating input and responds to new articles', () => {
    const Component = loadSolution('react-article-sorting');
    const articles = Object.freeze([
      Object.freeze({ title: 'Alpha', upvotes: 4, date: '2026-02-01' }),
      Object.freeze({ title: 'Beta', upvotes: 20, date: '2026-01-01' }),
      Object.freeze({ title: 'Gamma', upvotes: 9, date: '2026-03-01' }),
    ]);
    const page = render(<Component articles={articles} />);
    const titles = () => screen.getAllByRole('row').slice(1).map(row => within(row).getAllByRole('cell')[0].textContent);
    expect(titles()).toEqual(['Beta', 'Gamma', 'Alpha']);
    fireEvent.click(screen.getByRole('button', { name: 'Most Recent' }));
    expect(titles()).toEqual(['Gamma', 'Alpha', 'Beta']);
    fireEvent.click(screen.getByRole('button', { name: 'Most Upvoted' }));
    expect(titles()).toEqual(['Beta', 'Gamma', 'Alpha']);
    expect(articles.map(article => article.title)).toEqual(['Alpha', 'Beta', 'Gamma']);

    fireEvent.click(screen.getByRole('button', { name: 'Most Recent' }));
    page.rerender(<Component articles={[
      ...articles,
      { title: 'Delta', upvotes: 1, date: '2026-04-01' },
    ]} />);
    expect(titles()).toEqual(['Delta', 'Gamma', 'Alpha', 'Beta']);
    expect(screen.getByRole('button', { name: 'Most Recent', pressed: true })).toBeInTheDocument();
  });
});

describe('Contact Form', () => {
  it('validates required fields and stores a submitted snapshot separately from the cleared draft', () => {
    const Component = loadSolution('react-contact-form');
    render(<Component />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Submitted information' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getByRole('alert')).toHaveTextContent('All fields are required.');
    change('Name', 'Alex');
    change('Email', 'alex@example.com');
    change('Message', 'Hello there');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    const submitted = screen.getByRole('region', { name: 'Submitted information' });
    expect(submitted).toHaveTextContent('Name: Alex');
    expect(submitted).toHaveTextContent('Email: alex@example.com');
    expect(submitted).toHaveTextContent('Message: Hello there');
    for (const label of ['Name', 'Email', 'Message']) expect(screen.getByLabelText(label)).toHaveValue('');
    change('Name', 'Blair');
    expect(submitted).toHaveTextContent('Name: Alex');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getByRole('alert')).toHaveTextContent('All fields are required.');
    expect(screen.queryByRole('region', { name: 'Submitted information' })).not.toBeInTheDocument();
  });
});

describe('Slideshow', () => {
  it('enforces both boundaries and supports previous and restart navigation', () => {
    const Component = loadSolution('react-slideshow-1');
    render(<Component slides={[
      { title: 'First', text: 'First body' },
      { title: 'Second', text: 'Second body' },
      { title: 'Third', text: 'Third body' },
    ]} />);
    const next = screen.getByRole('button', { name: 'Next' });
    const previous = screen.getByRole('button', { name: 'Prev' });
    const restart = screen.getByRole('button', { name: 'Restart' });
    expect(screen.getByRole('heading', { name: 'First' })).toBeInTheDocument();
    expect(previous).toBeDisabled();
    expect(restart).toBeDisabled();
    fireEvent.click(next);
    expect(screen.getByText('Second body')).toBeInTheDocument();
    fireEvent.click(next);
    expect(screen.getByRole('heading', { name: 'Third' })).toBeInTheDocument();
    expect(next).toBeDisabled();
    fireEvent.click(next);
    expect(screen.getByRole('heading', { name: 'Third' })).toBeInTheDocument();
    fireEvent.click(previous);
    expect(screen.getByRole('heading', { name: 'Second' })).toBeInTheDocument();
    fireEvent.click(restart);
    expect(screen.getByRole('heading', { name: 'First' })).toBeInTheDocument();
    expect(previous).toBeDisabled();
    expect(restart).toBeDisabled();
  });

  it('disables every navigation button for a one-slide presentation', () => {
    const Component = loadSolution('react-slideshow-1');
    render(<Component slides={[{ title: 'Only slide', text: 'Only body' }]} />);
    expect(screen.getByText('Only body')).toBeInTheDocument();
    for (const name of ['Next', 'Prev', 'Restart']) expect(screen.getByRole('button', { name })).toBeDisabled();
  });
});

describe('Patient Medical Records', () => {
  it('waits for Show, displays all selected records, and cycles patients in ID order', () => {
    const Component = loadSolution('patient-medical-records');
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const patients = [
      { id: 3, name: 'Chris', dob: '1990-01-01', height: 180, records: [
        { id: 'c1', date: '2026-01-01', diagnosis: 'Checkup', weight: 70, doctor: 'Dr West' },
        { id: 'c2', date: '2026-02-01', diagnosis: 'Follow-up', weight: 71, doctor: 'Dr East' },
      ] },
      { id: 1, name: 'Alex', dob: '1991-02-02', height: 170, records: [
        { id: 'a1', date: '2026-03-01', diagnosis: 'Screening', weight: 65, doctor: 'Dr South' },
      ] },
      { id: 2, name: 'Blair', dob: '1992-03-03', height: 160, records: [
        { id: 'b1', date: '2026-04-01', diagnosis: 'Consultation', weight: 60, doctor: 'Dr North' },
      ] },
    ];
    const originalIds = patients.map(patient => patient.id);
    render(<Component patients={patients} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    expect(alert).toHaveBeenCalledWith('Please select a patient name');

    change('Patient', '3');
    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    const records = screen.getByRole('region', { name: 'Patient records' });
    expect(within(records).getByText('Chris')).toBeInTheDocument();
    expect(within(records).getByText('Checkup')).toBeInTheDocument();
    expect(within(records).getByText('Follow-up')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(within(records).getByText('Alex')).toBeInTheDocument();
    expect(within(records).queryByText('Follow-up')).not.toBeInTheDocument();

    change('Patient', '2');
    expect(within(records).getByText('Alex')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    expect(within(records).getByText('Blair')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(within(records).getByText('Chris')).toBeInTheDocument();
    expect(patients.map(patient => patient.id)).toEqual(originalIds);
  });
});

describe('Blog Post', () => {
  it('requires both fields, clears successful drafts, and deletes only the chosen duplicate-title post', () => {
    const Component = loadSolution('blog-post');
    render(<Component />);
    const create = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(create);
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    change('Title', 'Shared title');
    change('Description', '   ');
    fireEvent.click(create);
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.getByLabelText('Title')).toHaveValue('Shared title');

    change('Description', 'First description');
    fireEvent.click(create);
    expect(screen.getByLabelText('Title')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
    change('Title', 'Shared title');
    change('Description', 'Second description');
    fireEvent.click(create);
    expect(screen.getAllByRole('article')).toHaveLength(2);
    const firstPost = screen.getAllByRole('article')[0];
    fireEvent.click(within(firstPost).getByRole('button', { name: 'Delete' }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.queryByText('First description')).not.toBeInTheDocument();
    expect(screen.getByText('Second description')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    change('Title', 'New post');
    change('Description', 'After deleting everything');
    fireEvent.click(create);
    expect(screen.getByRole('article')).toHaveTextContent('New post');
  });
});

describe('Employee Validation', () => {
  it('requires all four valid fields, rejects future dates and invalid IDs, and resets after submit', () => {
    const Component = loadSolution('employee-validation');
    render(<Component />);
    const submit = screen.getByRole('button', { name: 'Submit' });
    expect(submit).toBeDisabled();

    change('Name', 'Jane Doe');
    change('Email', 'jane@example.com');
    change('Employee ID', '012345');
    const today = new Date();
    const asDateInput = (date: Date) => [
      date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0'),
    ].join('-');
    change('Joining Date', asDateInput(today));
    expect(submit).toBeEnabled();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    change('Joining Date', asDateInput(tomorrow));
    expect(submit).toBeDisabled();
    // HTML date inputs accept more than four year digits. Lexical ordering
    // would incorrectly consider this earlier than a year beginning with 2.
    change('Joining Date', '10000-01-01');
    expect(screen.getByLabelText('Joining Date')).toHaveValue('10000-01-01');
    expect(submit).toBeDisabled();
    change('Joining Date', asDateInput(today));
    change('Employee ID', '12345a');
    expect(submit).toBeDisabled();
    change('Employee ID', '012345');
    change('Name', 'Joe');
    expect(submit).toBeDisabled();
    change('Name', 'Jane Doe');
    change('Email', 'invalid-address');
    expect(submit).toBeDisabled();
    change('Email', 'jane@example.com');
    expect(submit).toBeEnabled();

    fireEvent.click(submit);
    for (const label of ['Name', 'Email', 'Employee ID', 'Joining Date']) {
      expect(screen.getByLabelText(label)).toHaveValue('');
    }
    expect(submit).toBeDisabled();
  });
});

describe('Word Omitter', () => {
  it('derives output without losing the input, toggles omission, clears, and respects new props', () => {
    const Component = loadSolution('react-word-omitter');
    const page = render(<Component omitWords={['a']} />);
    const input = screen.getByRole('textbox');
    const toggle = screen.getByRole('button', { name: 'Show All Words' });
    fireEvent.change(input, { target: { value: 'This is a test sentence.' } });
    expect(screen.getByText('This is test sentence.')).toBeInTheDocument();
    expect(input).toHaveValue('This is a test sentence.');
    fireEvent.click(toggle);
    expect(screen.getByText('This is a test sentence.')).toBeInTheDocument();
    fireEvent.click(toggle);
    page.rerender(<Component omitWords={['test']} />);
    expect(screen.getByText('This is a sentence.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(input).toHaveValue('');
    expect(screen.queryByText('This is a sentence.')).not.toBeInTheDocument();
  });
});

describe('CryptoRank Exchange', () => {
  it('formats live conversions, enforces inclusive amount boundaries, and handles cleared input', () => {
    const Component = loadSolution('cryptorank-exchange');
    const currencies = [
      { code: 'BTC', name: 'Bitcoin', rate: 0.01 },
      { code: 'ETH', name: 'Ethereum', rate: 0.02 },
    ];
    render(<Component balance={1000} currencies={currencies} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getAllByText('0.00000000')).toHaveLength(2);
    change('Amount', '100');
    expect(screen.getByText('1.00000000')).toBeInTheDocument();
    expect(screen.getByText('2.00000000')).toBeInTheDocument();
    change('Amount', '1000');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('10.00000000')).toBeInTheDocument();
    change('Amount', '1000.01');
    expect(screen.getByRole('alert')).toHaveTextContent('Amount cannot exceed the available balance');
    expect(screen.getAllByText('n/a')).toHaveLength(2);
    change('Amount', '0.001');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getAllByText('n/a')).toHaveLength(2);
    change('Amount', '0.01');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('0.00010000')).toBeInTheDocument();
    change('Amount', '');
    expect(screen.getByRole('alert')).toHaveTextContent('Amount cannot be empty');
    // The official cleared-input example specifically returns the table to zero.
    expect(screen.getAllByText('0.00000000')).toHaveLength(2);
  });
});
