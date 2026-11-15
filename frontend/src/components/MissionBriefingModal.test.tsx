import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { MissionBriefingModal } from './MissionBriefingModal'

describe('mission briefing modal', () => {
  it('renders an accessible, source-linked first step', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <MissionBriefingModal onClose={() => {}} />
      </MemoryRouter>,
    )

    expect(markup).toContain('role="dialog"')
    expect(markup).toContain('aria-modal="true"')
    expect(markup).toContain('What changes when combustion happens away from Earth?')
    expect(markup).toContain('PROJECT INTERPRETATION')
    expect(markup).toContain('NASA Glenn - Combustion Science')
  })
})
