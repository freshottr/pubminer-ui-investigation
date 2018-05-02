describe('The home page', function() {
    // 'PubMiner' title is on /list
    it('contains the PubMiner title', function () {
        cy.visit('/list')
        cy.title().should('include', 'PubMiner')
    })

    it('contains have an empty input box', function() {
        cy.get('input').should('not.have.value', 'US')
    })

    // TODO: figure out how the date and count will be implemented and check for those things
    it('displays a last updated date and article count', function(){
        cy.get('#stat-items').should('contain', 'Last update occurred on')
        cy.get('#stat-items').should('contain','new articles were added') //any number
        cy.get('#stat-items').should('contain','sentences containing demographic information were discovered') //any number
        cy.get('#stat-items').should('contain','tables containing demographic rows were discovered') //any number
    })


    // TODO: should we have an export button here?
})
