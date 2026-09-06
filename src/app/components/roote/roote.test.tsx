import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import {
  Accordion,
  RadioCard,
  SegmentedControl,
  Stepper,
  Modal,
  ConsentPanel,
  BeforeAfterSlider,
  Button,
  Stat,
  AnalysisMetric,
  ProgramCard,
} from './index';

const wrap = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Button', () => {
  it('renders a link when `to` is set, a button otherwise', () => {
    const { rerender } = wrap(<Button to="/analysis">Start</Button>);
    expect(screen.getByRole('link', { name: 'Start' })).toHaveAttribute('href', '/analysis');
    rerender(<MemoryRouter><Button onClick={() => {}}>Go</Button></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });
});

describe('Accordion', () => {
  it('toggles a panel and wires aria-expanded / aria-controls', async () => {
    wrap(<Accordion items={[{ id: 'a', title: 'Question one', body: 'Answer one' }]} />);
    const btn = screen.getByRole('button', { name: 'Question one' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Answer one')).toBeVisible();
  });

  it('single-open by default: opening one closes the other', async () => {
    wrap(
      <Accordion
        items={[
          { id: 'a', title: 'One', body: 'A' },
          { id: 'b', title: 'Two', body: 'B' },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'One' }));
    await userEvent.click(screen.getByRole('button', { name: 'Two' }));
    expect(screen.getByRole('button', { name: 'One' })).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('RadioCard', () => {
  it('reports the selected value', async () => {
    const onChange = vi.fn();
    wrap(
      <>
        <RadioCard name="g" value="male" title="Male" onChange={onChange} />
        <RadioCard name="g" value="female" title="Female" onChange={onChange} />
      </>,
    );
    await userEvent.click(screen.getByText('Female'));
    expect(onChange).toHaveBeenCalledWith('female');
  });
});

describe('SegmentedControl', () => {
  it('is a radiogroup and fires onChange', async () => {
    const onChange = vi.fn();
    wrap(
      <SegmentedControl
        label="View"
        value="before"
        onChange={onChange}
        options={[
          { value: 'before', label: 'Before' },
          { value: 'after', label: 'After' },
        ]}
      />,
    );
    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'After' }));
    expect(onChange).toHaveBeenCalledWith('after');
  });
});

describe('Stepper', () => {
  it('marks the current step with aria-current', () => {
    wrap(
      <Stepper
        label="Progress"
        current={1}
        steps={[
          { id: 'a', label: 'You' },
          { id: 'b', label: 'Concern' },
          { id: 'c', label: 'Scan' },
        ]}
      />,
    );
    const current = screen.getByText('2');
    expect(current).toHaveAttribute('aria-current', 'step');
  });
});

describe('Modal', () => {
  it('renders when open, closes on Escape', async () => {
    const onClose = vi.fn();
    wrap(
      <Modal open onClose={onClose} title="Consent">
        <p>body</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Consent' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('renders nothing when closed', () => {
    wrap(<Modal open={false} onClose={() => {}} title="X">body</Modal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('ConsentPanel', () => {
  it('requires an explicit check and can expand its explanation', async () => {
    const onChange = vi.fn();
    wrap(
      <ConsentPanel
        checked={false}
        onChange={onChange}
        label="I agree"
        summary="why"
        details="the full explanation"
      />,
    );
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);

    const more = screen.getByRole('button', { name: /what this means/i });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    expect(more).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('BeforeAfterSlider', () => {
  it('exposes a labelled range control with a described position', () => {
    wrap(
      <BeforeAfterSlider
        ariaLabel="Reveal before and after"
        beforeLabel="Before"
        afterLabel="After"
        before={<div>b</div>}
        after={<div>a</div>}
      />,
    );
    const slider = screen.getByRole('slider', { name: 'Reveal before and after' });
    expect(slider).toHaveValue('50');
    expect(slider).toHaveAttribute('aria-valuetext', expect.stringContaining('Before'));
  });
});

describe('PENDING-safe primitives', () => {
  it('Stat shows a pending chip instead of a fabricated value', () => {
    wrap(<Stat label="Hair density" value={null} pendingLabel="density" />);
    expect(screen.getByText('[PENDING: density]')).toBeInTheDocument();
  });

  it('AnalysisMetric shows a pending chip when the level is null', () => {
    wrap(<AnalysisMetric label="Scalp condition" level={null} />);
    expect(screen.getByText('[PENDING: Scalp condition]')).toBeInTheDocument();
  });

  it('ProgramCard never prints an invented price', () => {
    wrap(
      <ProgramCard
        durationLabel="180 days"
        priceLabel={null}
        perDayLabel={null}
        includes={['Density treatment', 'Regrowth Shampoo']}
        selectLabel="Choose"
      />,
    );
    expect(screen.getByText('[PENDING: program price]')).toBeInTheDocument();
  });
});
