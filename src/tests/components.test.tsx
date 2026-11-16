import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { GlassCard } from '../components/common/GlassCard';

describe('Common UI Components', () => {
  it('renders Button with variants and handles disabled state', () => {
    render(<Button variant="primary">Launch Sensing</Button>);
    const button = screen.getByRole('button', { name: /launch sensing/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders Badge with custom status text and pulse indicator', () => {
    render(
      <Badge variant="cyan" pulse>
        Live rPPG
      </Badge>
    );
    expect(screen.getByText(/live rppg/i)).toBeInTheDocument();
  });

  it('renders GlassCard with children and custom styles', () => {
    render(
      <GlassCard variant="glow-cyan" data-testid="test-card">
        <div>PulseVerse Telemetry</div>
      </GlassCard>
    );
    expect(screen.getByTestId('test-card')).toBeInTheDocument();
    expect(screen.getByText('PulseVerse Telemetry')).toBeInTheDocument();
  });
});
