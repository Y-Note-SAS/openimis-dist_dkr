// =====================================================
// 🔹 NAVIGATION HELPERS
// =====================================================

export function goToClaimsPage() {
  cy.get('[data-cy="ClaimMainMenu"]').click();
  cy.get('[href="/front/claim/healthFacilities"]').click();
}

export function goToClaimForm(code, admin) {
  if (!code && !admin) {
    throw new Error('Either code or admin must be provided');
  }

  if (!!admin) {
    goToClaimsPage();
    cy.get('[data-cy="claim-admin-filter"]').click();
    //cy.get(`[data-value='\"${admin}\"']`).click();
    cy.get('[data-cy="claim-admin-filter"]').find('input').first()
        .type(admin);
    cy.get('[role="listbox"]').should('be.visible')
        .find('[role="option"]').contains(admin).first().click();
    cy.get('[data-cy="create-claim-button"]').click();
    return;
  }

  cy.goToClaimsPage();
  cy.filterClaim({ code: code });
  cy.selectSearcherRow(code);
  return;
}

export function createNewClaim(claim={}) {
  cy.goToClaimForm(claim.code, claim.admin);
  fillClaimForm(claim);
  cy.clickSave();
}

export function clickDeleteClaim() {
  cy.get('[data-cy="delete-claim-button"]').first().click();
  cy.get('[data-cy="dialog-confirm-button"]').click();
}

export function addItemsToClaim(items) {
//   cy.get('[data-cy="claim-item-picker"]').click(); // add only one item randomly
//   cy.get('[role="option"]').first().click();

  cy.wrap(items).each((item) => {

    cy.get('[data-cy="claim-item-picker"] input')
      .last()
      .should('exist')
      .clear()
      .type(item.code);

    cy.get('[role="listbox"]')
      .should('be.visible');

    cy.get('[role="option"]')
      .first()
      .click({ force: true });

  });
}

export function addServicesToClaim(services) {
  //cy.get('[data-cy="claim-service-picker"]').click(); // add only one service randomly
  //cy.get('[role="option"]').first().click();

  cy.wrap(services).each((service) => {

    cy.get('[data-cy="claim-service-picker"] input')
      .last()
      .should('exist')
      .clear()
      .type(service.code);

    cy.get('[role="listbox"]')
      .should('be.visible');

    cy.get('[role="option"]')
      .first()
      .click({ force: true });

  });
}

// =====================================================
// 🔹 FORM HELPERS (CLAIM MASTER PANEL)
// =====================================================

export function fillClaimForm({
  insureeChfId = '070707055',
  visitType = 'O', // O = Outpatient
  careType = 'IPD',
  diagnosis = 'A000',
  code = 'CLM001',
  explanation = 'Test claim from Cypress',
  claimPatientCondition = 'H',
  admin = 'Admin Admin',
  hFCode = 'JMHOS001',
  services = [
    { code: 'I117' },
    { code: 'I125' }
  ],
  items = [
    { code: '0002' },
    { code: '0011' }
  ]
} = {}) {

  // Insuree picker
  cy.get('[data-cy="claim-insuree-picker"] input')
    .clear()
    .type(insureeChfId);
  cy.wait(150);

  // Visit Date From
  cy.get('button[type="button"] > svg[data-testid="CalendarIcon"]')
    .first()
    .parent()
    .click();
  cy.get('[data-cy="claim-vdate-from-picker"]').contains('10').click();

  // Visit Date To
  cy.get('button[type="button"] > svg[data-testid="CalendarIcon"]')
    .eq(1)
    .parent()
    .click();
  cy.get('[data-cy="claim-vdate-to-picker"]').contains('15').click();

  // Claimed Date
  cy.get('button[type="button"] > svg[data-testid="CalendarIcon"]')
    .eq(2)
    .parent()
    .click();
  cy.get('[data-cy="claim-claimed-date-picker"]').contains('20').click();

  // Visit Type
  //cy.get('[data-cy="claim-visit-type-picker"]').click();
  //cy.get(`[data-value='\"${visitType}\"']`).click();

  // Care Type
  cy.get('[data-cy="claim-care-type-picker"]').click();
  cy.get(`[data-value='\"${careType}\"']`).click();

  // Main Diagnosis
  cy.get('[data-cy="claim-main-diagnosis-picker"]')
    .click()
    .type(diagnosis);
  cy.contains(diagnosis).click();

  // Claim Code
  cy.get('[data-cy="claim-code-validated-input"]')
    .find('input')
    .first()
    .clear()
    .type(code);

  // Explanation
  cy.get('[data-cy="claim-explanation-input"]')
    .find('input')
    .first()
    .clear()
    .type(explanation);

  cy.get('[data-cy="claim-patient-condition-picker"]').click();
  cy.get(`[data-value='\"${claimPatientCondition}\"']`).click();

  console.log('services: ', services);
  console.log('items: ', items);

  addItemsToClaim(items);
  addServicesToClaim(services);
}


// =====================================================
// 🔹 ASSERTION HELPERS
// =====================================================

export function filterClaim({
  code = 'CLM001',
  hFCode = 'JMHOS001'
} = {}) {

  goToClaimsPage();

  cy.get('[data-cy="claim-code-filter"] input')
    .clear()
    .type(code);

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
// 🔹 FULL CLAIM WORKFLOW TEST
// =====================================================

describe('Full Claim Workflow', () => {

  it('Should create, verify, update and delete a claim', () => {

    // ------------------ LOGIN ------------------
    cy.login();

    // ------------------ CREATE CLAIM ------------------

    cy.createNewClaim({
      code: 'CLM001',
      admin: 'Admin Admin'
    });

    // ------------------ VERIFY CLAIM ------------------
    filterClaim({
      code: 'CLM001',
      hFCode: 'JMHOS001'
    });

    // ------------------ MODIFY CLAIM ------------------
    cy.selectSearcherRow('CLM001');

    cy.get('[data-cy="claim-explanation-input"]')
      .find('input')
      .first()
      .clear()
      .type('Updated Explanation');

    cy.clickSave();

  });

});