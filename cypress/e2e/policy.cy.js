// Test data
const openIMISHeadInsuree = {
  chfId: '070707070',
  firstName: 'Joseph',
  lastName: 'Macintyre',
  gender: 'Male',
};

const openIMISPolicy = {
  product: {
    code: 'BCUL0001',
    name: 'Basic Cover Ultha',
  },
  value: 10000,
};
const policy = {
  product: {
    code: 'FCUL0001',
    name: 'Fixed Cycle Cover Ultha',
  },
  officer: { code: 'Admin Admin' },
};

const premium = {
  amount: '250000',
  receiptNo: 'Receipt-0001',
  paymentDate: { day: '26', month: '02', year: '2026' },
  payer: 'Coffee Farmers Association',
  paymentType: 'Cash',
};

// Policy actions
const Policy = {

  value: () => {
    return cy.contains('Policy value')
      .find('input')
      .invoke('val');
  },

  goToFamilyForm: (head, options = {}) => {
    const { failIfMissing = true } = options;

    cy.goToSubMenu('Insurees and Policies', 'Families/Group');
    cy.enterMuiInput('Head Ins. No.', head.chfId, "input");
    cy.scrollTo('right');
    cy.contains('button', 'Search').click({ force: true });
    return cy.get('body').then(($body) => {
      const hasFamily = $body.find('tr').toArray().some((row) => row.innerText.includes(head.chfId));

      if (!hasFamily) {
        if (!failIfMissing) {
          cy.log(`Family ${head.chfId} not found, skipping action`);
          return false;
        }
        throw new Error(`Family ${head.chfId} not found`);
      }

      cy.openRow(head.chfId);
      return true;
    });
  },

  add: (head, policy) => {
    Policy.goToFamilyForm(head);

    cy.contains('button', 'Add policy').click({ force: true });

    cy.chooseMuiAutocomplete('Product', policy.product.name);
    cy.chooseMuiSelect('Officer', policy.officer.code);

    cy.save();
    cy.contains('button', 'Close').click();
  },

  select: (policy) => {
    cy.contains('tr', policy.product.code).click();
  },

  payPremium: (head, policy, premium) => {
    Policy.goToFamilyForm(head);
    Policy.select(policy);

    cy.get('[aria-label="Add new contribution"]').click({ force: true });
    
    // Fill form
    cy.chooseMuiDatePicker('Payment Date', premium.paymentDate);
    cy.chooseMuiSelect('Payer', premium.payer);
    cy.chooseMuiSelect('Payment Type', premium.paymentType);
    cy.enterMuiInput('Amount', premium.amount);
    cy.enterMuiInput('Receipt No.', premium.receiptNo);

    // Handle contribution messages
    cy.get('body').then(($body) => {
      // premium > policy value
      if ($body.text().includes('Sum of contributions exceeds policy value. Saving not allowed.')) {
        cy.log('Cannot save: contribution exceeds policy value.');
      } else {
        cy.save();

        cy.get('body').then(($dialogBody) => {

          // premium < policy value
          if ($dialogBody.text().includes('The contribution is lower than the policy value')) {
            cy.contains('button', 'OK').click();

            cy.get('body').then(($secondDialog) => {
              if ($secondDialog.text().includes('Should the policy come into force?')) {
                cy.contains('button', 'Yes').click();
              }
            });
          }
          // premium = policy value
          else if ($dialogBody.text().includes('The contribution matches the value of the policy')) {
            cy.contains('button', 'OK').click();
          }
        });
      }
    });
  },

  deletePremium: (head, policy, premium, options = {}) => {
    const { failIfMissing = true } = options;

    Policy.goToFamilyForm(head, { failIfMissing }).then((familyOpened) => {
      if (!familyOpened) {
        return;
      }

      cy.get('body').then(($body) => {
        const hasPolicy = $body.find('tr').toArray().some((row) => row.innerText.includes(policy.product.code));

        if (!hasPolicy) {
          if (!failIfMissing) {
            cy.log(`Policy ${policy.product.code} not found, skipping premium deletion`);
            return;
          }
          throw new Error(`Policy ${policy.product.code} not found for premium deletion`);
        }

        Policy.select(policy);

        cy.get('body').then(($policyBody) => {
          const hasPremium = $policyBody.find('tr').toArray().some((row) => row.innerText.includes(premium.receiptNo));

          if (!hasPremium) {
            if (!failIfMissing) {
              cy.log(`Premium ${premium.receiptNo} not found, skipping deletion`);
              return;
            }
            throw new Error(`Premium ${premium.receiptNo} not found for deletion`);
          }

          cy.contains('tr', premium.receiptNo)
            .within(() => {
              cy.contains('button', 'Delete').click({ force: true });
            });
          cy.contains('button', 'Yes').click();
        });
      });
    });
  },

  delete: (head, policy, options = {}) => {
    const { failIfMissing = true } = options;

    Policy.goToFamilyForm(head, { failIfMissing }).then((familyOpened) => {
      if (!familyOpened) {
        return;
      }

      cy.get('body').then(($body) => {
        const hasPolicy = $body.find('tr').toArray().some((row) => row.innerText.includes(policy.product.code));

        if (!hasPolicy) {
          if (!failIfMissing) {
            cy.log(`Policy ${policy.product.code} not found, skipping deletion`);
            return;
          }
          throw new Error(`Policy ${policy.product.code} not found for deletion`);
        }

        Policy.select(policy);

        cy.contains('tr', policy.product.code)
          .within(() => {
            cy.contains('button', 'Delete').click({ force: true });
          });
        cy.contains('button', 'Ok').click();
      });
    });
  },
};

// Tests
describe('Policy Workflow', () => {
  afterEach(() => {
    cy.login();
    Policy.deletePremium(openIMISHeadInsuree, openIMISPolicy, premium, { failIfMissing: false });
    Policy.delete(openIMISHeadInsuree, openIMISPolicy, { failIfMissing: false });
    Policy.delete(openIMISHeadInsuree, policy, { failIfMissing: false });
  });

  it('should add, pay and delete a policy cleanly', () => {

    cy.login();

    // Add policy
    Policy.add(openIMISHeadInsuree, policy);

    // Pay premium
    Policy.payPremium(
      openIMISHeadInsuree,
      openIMISPolicy,
      premium
    );

    // Delete premium
    Policy.deletePremium(
      openIMISHeadInsuree,
      openIMISPolicy,
      premium
    );

    // Delete policy
    Policy.delete(
      openIMISHeadInsuree,
      openIMISPolicy
    );

  });

});
