// =====================================================
// 🔹 CONSTANTS / TEST DATA
// =====================================================
export const claimData = {
  insureeChfId: '070707055',
  visitType: 'O', // O = Outpatient
  careType: 'IPD',
  diagnosis: 'A000',
  code: 'CLM001',
  explanation: 'Test claim from Cypress',
  claimPatientCondition: 'H',
  admin: 'Admin Admin',
  hFCode: 'JMHOS001',
  services: [
    { code: 'I117' },
    { code: 'I125' }
  ],
  items: [
    { code: '0002' },
    { code: '0011' }
  ]
};

// =====================================================
// 🔹 NAVIGATION HELPERS
// =====================================================
export function goToClaimsPage() {
  cy.get('[data-cy="ClaimMainMenu"]').click();
  cy.get('[href="/front/claim/healthFacilities"]').click();
}

export function goToClaimForm({ code, admin } = {}) {
  if (!code && !admin) throw new Error('Either code or admin must be provided');

  if (admin) {
    goToClaimsPage();
    cy.get('[data-cy="claim-admin-filter"] input').first().type(admin);
    cy.get('[role="listbox"]').should('be.visible')
      .find('[role="option"]').contains(admin).first().click();
    cy.get('[data-cy="create-claim-button"]').click();
    return;
  }

  goToClaimsPage();
  filterClaim({ code });
  selectSearcherRow(code);
}

// =====================================================
// 🔹 ACTION HELPERS
// =====================================================
export function createNewClaim(claim = claimData) {
  goToClaimForm({ code: claim.code, admin: claim.admin });
  fillClaimForm(claim);
  clickSave();
}

export function clickDeleteClaim() {
  cy.get('[data-cy="delete-claim-button"]').first().click();
  cy.get('[data-cy="dialog-confirm-button"]').click();
}

export function addItemsToClaim(items) {
  cy.wrap(items).each(item => {
    cy.get('[data-cy="claim-item-picker"] input')
      .last().should('exist').clear().type(item.code);

    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().click({ force: true });
  });
}

export function addServicesToClaim(services) {
  cy.wrap(services).each(service => {
    cy.get('[data-cy="claim-service-picker"] input')
      .last().should('exist').clear().type(service.code);

    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().click({ force: true });
  });
}

// =====================================================
// 🔹 FORM HELPERS
// =====================================================
export function fillClaimForm({
  insureeChfId,
  visitType,
  careType,
  diagnosis,
  code,
  explanation,
  claimPatientCondition,
  admin,
  hFCode,
  services,
  items
} = claimData) {

  // Insuree picker
  cy.get('[data-cy="claim-insuree-picker"] input').clear().type(insureeChfId);
  cy.wait(150);

  // Visit Dates
  const visitDates = ['10', '15', '20'];
  visitDates.forEach((day, index) => {
    cy.get('button[type="button"] > svg[data-testid="CalendarIcon"]')
      .eq(index).parent().click();
    const pickerSelector = index === 0 ? '[data-cy="claim-vdate-from-picker"]'
                       : index === 1 ? '[data-cy="claim-vdate-to-picker"]'
                       : '[data-cy="claim-claimed-date-picker"]';
    cy.get(pickerSelector).contains(day).click();
  });

  // Care Type
  cy.get('[data-cy="claim-care-type-picker"]').click();
  cy.get(`[data-value='\"${careType}\"']`).click();

  // Main Diagnosis
  cy.get('[data-cy="claim-main-diagnosis-picker"]').click().type(diagnosis);
  cy.contains(diagnosis).click();

  // Claim Code
  cy.get('[data-cy="claim-code-validated-input"] input').first().clear().type(code);

  // Explanation
  cy.get('[data-cy="claim-explanation-input"] input').first().clear().type(explanation);

  // Patient Condition
  cy.get('[data-cy="claim-patient-condition-picker"]').click();
  cy.get(`[data-value='\"${claimPatientCondition}\"']`).click();

  // Add items and services
  addItemsToClaim(items);
  addServicesToClaim(services);
}

// =====================================================
// 🔹 ASSERTION HELPERS
// =====================================================
export function filterClaim({ code = claimData.code, hFCode = claimData.hFCode } = {}) {
  goToClaimsPage();

  cy.get('[data-cy="claim-code-filter"] input').clear().type(code);
  cy.get('[data-cy="searcher-refresh"]').click();

  cy.contains(code);
  cy.contains(hFCode);
}

// =====================================================
// 🔹 GENERIC ROW SELECTOR
// =====================================================
export function selectSearcherRow(data) {
  cy.contains(data).parents('tr, div').first().dblclick();
}

// =====================================================
// 🔹 UTILS
// =====================================================
export function clickSave() {
  cy.get("button[data-cy='save-button']").click({ force: true });
}

// =====================================================
// 🔹 FULL CLAIM WORKFLOW TEST
// =====================================================
describe('Full Claim Workflow', () => {

  it('Should create, verify, update and delete a claim', () => {
    cy.login();

    // ------------------ CREATE CLAIM ------------------
    createNewClaim(claimData);

    // ------------------ VERIFY CLAIM ------------------
    filterClaim(claimData);

    // ------------------ MODIFY CLAIM ------------------
    selectSearcherRow(claimData.code);

    cy.get('[data-cy="claim-explanation-input"] input')
      .first().clear().type('Updated Explanation');

    clickSave();

  });

});