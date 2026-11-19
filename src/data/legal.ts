import { CONTACT_EMAIL, NAME } from './index'

// ── Legal facts ───────────────────────────────────────────────────────────────
// The imprint has to name a full postal address (§5 DDG), so the street and the
// postal code belong here; the privacy page names the same person. Everything
// else on that page is derived from the code, never asserted.

export const LEGAL = {
  name: NAME,
  /** §5 DDG needs the street; empty, the imprint renders without it. */
  street: '',
  postalCode: '',
  city: 'Ulm',
  country: 'Deutschland',
  email: CONTACT_EMAIL,
  githubPrivacy:
    'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement'
}

/** The registered address as lines, skipping whatever is not filled in. */
export const legalAddressLines = [
  LEGAL.name,
  LEGAL.street,
  [LEGAL.postalCode, LEGAL.city].filter(Boolean).join(' '),
  LEGAL.country
].filter(Boolean)
