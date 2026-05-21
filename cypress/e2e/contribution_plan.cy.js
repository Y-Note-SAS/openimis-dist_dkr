const contributionPlan = {
    code: "CP007",
    name: "Plan familiale",
    calculationRule: "CV: legacy",
    product: "BCTA0001 Basic Cover Tahida",
    periodicity: "4.00",
    validFrom: "13"
}

// contributions plans actions
const ContributionPlan = {

    goToList: () => {
        cy.contains('Administration').click();
        cy.contains('a', 'Contribution Plans').click();
    },

    goToForm: (data) => {
        ContributionPlan.goToList();
        if (data?.code) {
            cy.enterMuiInput('Code', data.code, "input");
            cy.contains('button', 'Search').click({ force: true });
            cy.openRow(data.code);
        } else {
            cy.get('.fab').click();
        }
    },

    fillForm: (data) => {
        cy.enterMuiInput('Code', data.code);
        cy.enterMuiInput('Name', data.name);
        cy.chooseMuiSelect('Calculation Rule', data.calculationRule);
        cy.chooseMuiSelect('Product', data.product);
        cy.enterMuiInput('Periodicity (no of months)', data.periodicity);
        cy.chooseMuiDatePicker('Valid from',data.validFrom);
        //cy.assertMuiInput('Valid from', data.validFrom)
    },

    verifyExists: (data) => {
        ContributionPlan.goToList();
        cy.enterMuiInput('Code', data.code, "input");
        cy.contains('button', 'Search').click({ force: true });
        cy.get('table').should('be.visible');
        //cy.scrollTo('right');
    },

    open: (data) => {
        ContributionPlan.verifyExists(data);
        cy.contains(data.code);
        cy.contains(data.name);
        cy.contains('td', data.code)
            .should('be.visible')
            .dblclick()
    },

    delete: (data, options = {}) => {
        const { failIfMissing = true } = options;

        ContributionPlan.verifyExists(data)
        cy.contains(data.code);
        cy.scrollTo('right');

        cy.get('body').then(($body) => {
            const hasContributionPlan = $body.find('tr').toArray().some((row) => row.innerText.includes(data.code));

            if (!hasContributionPlan) {
                if (!failIfMissing) {
                    cy.log(`Contribtion Plan ${data.code} not found, skipping deletion`);
                    return;
                }
                throw new Error(`Contribution Plan ${data.code} not found for deletion`);
            }

            cy.contains('tr', data.code)
                .within(() => {
                    cy.contains('button', 'Delete').click();
                });
            cy.contains('button', 'OK', { matchCase: false }).click();

            // Vérifier la suppression
            ContributionPlan.verifyExists(contributionPlan);
            cy.contains('td', contributionPlan.code).should('not.exist');
        });
    },
};

// Tests for contributions plans
describe('Contribution Plan Workflow', () => {

    afterEach(() => {
        // delete
        ContributionPlan.delete(contributionPlan, { failIfMissing: false });
    });

    it('Create and update a new Contribution plan', () => {

        cy.login();
        // create
        ContributionPlan.goToForm(null);
        ContributionPlan.fillForm(contributionPlan);
        cy.save();

        // // Verification
        ContributionPlan.verifyExists(contributionPlan);
        cy.contains(contributionPlan.code).should('be.visible');
        cy.contains(contributionPlan.name).should('be.visible');

         // Update Contribution Plan
        const updatedName = 'Contribution 00033';
        ContributionPlan.open(contributionPlan);
        cy.enterMuiInput('Name', updatedName);
        cy.save();

        // check
        ContributionPlan.verifyExists({
            ...contributionPlan,
            name: updatedName
        });
    });

});