import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import NavBar from '../components/NavBar';

expect.extend(toHaveNoViolations);

describe('Accessibility checks', () => {
  it('NavBar should have no accessibility violations', async () => {
    const { container } = render(<NavBar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
