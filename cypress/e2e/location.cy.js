const testData = {
    healthfacility: {
        code: "HP04",
        name: "Hopital de munich",
        location: "R1D1",
        level: "Health Center",
        legalForm: "Government",
        careType: "In - Patient",
        accCode: "002E",
        phone: "677335455",
        fax: "BP89",
        email: "hp@gmail.co",
        servicesPricelist: "Ultha Govt. Dispensary List",
    }
};

// healthFacility actions
const Healthfacility = {

    goToList: () => {
        cy.contains('Administration').click();
        cy.contains('a', 'Health Facilities').click();
    },

    goToForm: (healthFacility) => {
        Healthfacility.goToList();
        if (healthFacility?.code) {
            cy.enterMuiInput('Code', healthFacility.code, "input");
            cy.contains('button', 'Search').click({ force: true });
            cy.openRow(healthFacility.code);
        } else {
            cy.get('.fab').click()
        }
    },

    fillForm: (healthFacility) => {
        cy.chooseMuiSelect('District', healthFacility.location);
        cy.chooseMuiSelect('Health Facility Legal Form', healthFacility.legalForm);
        cy.chooseMuiSelect('Health Facility Level', healthFacility.level);
        cy.chooseMuiSelect('Care Type', healthFacility.careType);
        cy.enterMuiInput('Code', healthFacility.code);
        cy.enterMuiInput('Accounting Code', healthFacility.accCode);
        cy.enterMuiInput('Name', healthFacility.name);
        cy.enterMuiInput('Phone', healthFacility.phone);
        cy.enterMuiInput('Fax', healthFacility.fax);
        cy.enterMuiInput('Email', healthFacility.email);
        cy.chooseMuiSelect("Services Pricelist", healthFacility.servicesPricelist);
    },

    verifyExists: (healthFacility) => {
        Healthfacility.goToList();
        cy.enterMuiInput('Code', healthFacility.code, "input");
        cy.contains('button', 'Search').click();
        cy.get('table').should('be.visible');
        //cy.scrollTo('right');
    },

    open: (healthFacility) => {
        Healthfacility.goToList();
        cy.enterMuiInput('Code', healthFacility.code, "input");
        cy.contains('button', 'Search').click({ force: true });
        cy.get('table').should('be.visible')
        cy.contains('td', healthFacility.code)
            .should('be.visible')
            .dblclick()
    },

    delete: (healthFacility, options = {}) => {
        const { failIfMissing = true } = options;

        Healthfacility.goToList()
        cy.enterMuiInput('Code', healthFacility.code, "input");
        cy.contains('button', 'Search').click({ force: true });
        cy.scrollTo('right');

        cy.get('body').then(($body) => {
            const hasHealthFacility = $body.find('tr').toArray().some((row) => row.innerText.includes(healthFacility.code));

            if (!hasHealthFacility) {
                if (!failIfMissing) {
                    cy.log(`Healthfacility ${healthFacility.code} not found, skipping deletion`);
                    return;
                }
                throw new Error(`HealthFacility ${healthFacility.code} not found for deletion`);
            }

            cy.contains('tr', healthFacility.code)
                .within(() => {
                    cy.contains('button', 'Delete').click();
                });
            cy.contains('button', 'OK', { matchCase: false }).click();

            // Vérifier la suppression
            Healthfacility.verifyExists(testData.healthfacility)
            cy.contains(testData.healthfacility.code).should('not.be.visible');
        });
    },
};

// Tests for healthFacilities
describe('HealthFacility Workflow', () => {

    afterEach(() => {
        // delete healthfacility
        Healthfacility.delete(testData.healthfacility, { failIfMissing: false });
    });

    // health facility creation
    it('Create a new health facility', () => {

        cy.login();
        Healthfacility.goToForm(null);
        Healthfacility.fillForm(testData.healthfacility);
        cy.save();

        // Verification
        Healthfacility.verifyExists(testData.healthfacility);
        cy.contains(testData.healthfacility.code).should('be.visible');
        cy.contains(testData.healthfacility.name).should('be.visible');

         // edit
        const updatedName = 'Hopital Central de Mendong';
        Healthfacility.open(testData.healthfacility);
        cy.enterMuiInput('Name', updatedName);
        cy.save();

        // check
        Healthfacility.verifyExists({
            ...testData.healthfacility,
            name: updatedName
        });
    });

    //update healthfacility
    // it('Update health facility', () => {

        
    // });

    //delete healthfacility
    // it('Delete healthfacility', ()=>{
        
    // });

});