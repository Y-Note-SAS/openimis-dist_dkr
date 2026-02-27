// Test data
const item = {
  code: '0002',
  name: 'Item Test Cypress',
  type: 'Drug',
  frequency: '1x/day',
  package: '10 PIECES',
  quantity: 50,
  maximumAmount: 1000,
  price: 4500,
  careType: 'In - Patient',
  patientCategory: 'ADULT',
};

const service = {
  code: '0002',
  name: 'Service Test Cypress',
  packagetype: 'Simple/atomic',
  type: 'Curative',
  category: 'Surgery',
  level: 'Simple Service',
  maximumAmount: 2000,
  price: 5000,
  careType: 'Out - Patient',
  frequency: '2x/day',
  patientCategory: 'CHILD',
};


// Items actions
const Item = {

  goToList: () =>
    cy.goToSubMenu('Administration', '/front/medical/medicalItems'),

  goToForm: (data) => {
    Item.goToList();

    if (data?.code) {
      cy.enterMuiInput('Code', data.code, "input");
      cy.contains('button', 'Search').click({force: true});
      cy.openRow(data.code);
    } else {
      cy.get('[aria-label="Add a new medical item"]').find('button').click();
    }
  },

  fillForm: (data) => {
    cy.enterMuiInput('Code', data.code);
    cy.enterMuiInput('Name', data.name);

    cy.chooseMuiSelect('Item Type', data.type);

    cy.enterMuiInput('Frequency (days)', data.frequency ?? '');
    cy.enterMuiInput('Package', data.package ?? '');
    cy.enterMuiInput('Quantity', data.quantity ?? '');
    cy.enterMuiInput('Maximum Amount per Claim', data.maximumAmount ?? '');
    cy.enterMuiInput('Price', data.price ?? '');

    cy.chooseMuiSelect('Care Type', data.careType);
  },

  verifyExists: (data) => {
    Item.goToList();

    cy.enterMuiInput('Code', data.code, "input");
    cy.contains('button', 'Search').click({force: true});

    cy.contains(data.code);
    cy.contains(data.name);
  },

  delete: (data, options = {}) => {
    const { failIfMissing = true } = options;

    Item.goToList();

    cy.enterMuiInput('Code', data.code, "input");
    cy.contains('button', 'Search').click({force: true});

    cy.get('body').then(($body) => {
      const hasItem = $body.find('tr').toArray().some((row) => row.innerText.includes(data.code));

      if (!hasItem) {
        if (!failIfMissing) {
          cy.log(`Medical item ${data.code} not found, skipping deletion`);
          return;
        }
        throw new Error(`Medical item ${data.code} not found for deletion`);
      }

      cy.contains('tr', data.code)
        .within(() => {
          cy.contains('button', 'Delete').click({force: true});
        });

      cy.contains('button', 'Yes', {matchCase: false}).click();
    });
  },
};


// Services actions
const Service = {

  goToList: () =>
    cy.goToSubMenu('Administration', '/front/medical/medicalServices'),

  goToForm: (data) => {
    Service.goToList();

    if (data?.code) {
      cy.enterMuiInput('Code', data.code, "input");
      cy.contains('button', 'Search').click({force: true});
      cy.openRow(data.code);
    } else {
      cy.get('[aria-label="Add a new medical service"]').find('button').click();
    }
  },

  fillForm: (data) => {
    cy.enterMuiInput('Code', data.code);
    cy.enterMuiInput('Name', data.name);

    cy.chooseMuiSelect('Type', data.packagetype);
    cy.chooseMuiSelect('Service Type', data.type);
    cy.chooseMuiSelect('Service Category', data.category);
    cy.chooseMuiSelect('Service Level', data.level);

    cy.enterMuiInput('Maximum Amount per Claim', data.maximumAmount ?? '');

    if (data.manualPrice !== undefined) {
      cy.enterMuiInput('Manual Price', data.manualPrice);
    }

    cy.enterMuiInput('Price', data.price ?? '');

    cy.chooseMuiSelect('Care Type', data.careType);
    cy.enterMuiInput('Frequency (days)', data.frequency ?? '');
  },

  verifyExists: (data) => {
    Service.goToList();

    cy.enterMuiInput('Code', data.code, "input");
    cy.contains('button', 'Search').click({force: true});

    cy.contains(data.code);
    cy.contains(data.name);
  },

  delete: (data, options = {}) => {
    const { failIfMissing = true } = options;

    Service.goToList();

    cy.enterMuiInput('Code', data.code, "input");
    cy.contains('button', 'Search').click({force: true});

    cy.get('body').then(($body) => {
      const hasService = $body.find('tr').toArray().some((row) => row.innerText.includes(data.code));

      if (!hasService) {
        if (!failIfMissing) {
          cy.log(`Medical service ${data.code} not found, skipping deletion`);
          return;
        }
        throw new Error(`Medical service ${data.code} not found for deletion`);
      }

      cy.contains('tr', data.code)
        .within(() => {
          cy.contains('button', 'Delete').click({force: true});
        });

      cy.contains('button', 'Yes', {matchCase: false}).click();
    });
  },
};


// Tests
describe('Medical Items & Services Workflow', () => {
  afterEach(() => {
    cy.login();
    Service.delete(service, { failIfMissing: false });
    Item.delete(item, { failIfMissing: false });
  });

  it('should execute complete medical flow cleanly', () => {

    cy.login();

    // Create item
    Item.goToForm();
    Item.fillForm(item);
    cy.save();
    Item.verifyExists(item);

    // Create service
    Service.goToForm();
    Service.fillForm(service);
    cy.save();
    Service.verifyExists(service);

    // Modify item
    Item.goToForm(item);
    cy.enterMuiInput('Frequency (days)', '2x/day');
    cy.save();

    // Modify service
    Service.goToForm(service);
    cy.enterMuiInput('Frequency (days)', '3x/day');
    cy.save();

  });

});
