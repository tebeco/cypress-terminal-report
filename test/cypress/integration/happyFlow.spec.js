describe('Happy flow.', () => {
  /**
   * Covers:
   * - printing of cy.commands
   * - printing xhr with STUBBED
   * - printing of console warn and console error
   * - printing of cy.route in case of XMLHTTPREQUEST API
   */
  it('Happy flow', () => {
    cy.visit('/commands/network-requests');

    let message = 'whoa, this comment does not exist';

    cy.server();
    cy.route('GET', 'comments/*').as('getComment');

    // we have code that gets a comment when
    // the button is clicked in scripts.js
    cy.wait(300, {log: false});
    cy.get('.network-btn').click();

    cy.wait('@getComment')
      .its('status')
      .should('eq', 200);

    cy.route('POST', '/comments').as('postComment');

    // we have code that posts a comment when
    // the button is clicked in scripts.js
    cy.get('.network-post').click();
    cy.wait('@postComment').should(xhr => {
      expect(xhr.requestBody).to.include('email');
      expect(xhr.requestHeaders).to.have.property('Content-Type');
      expect(xhr.responseBody).to.have.property('name', 'Using POST in cy.intercept()');
    });

    cy.window().then(w => w.console.error(null, undefined, '', false, function () {}));
    cy.window().then(w => w.console.log({a: 'b'}, {c: 'd'}, 10, 'string'));
    cy.window().then(w => w.console.warn('This is a warning message'));
    cy.window().then(w => w.console.error('This is an error message'));
    cy.window().then(w => w.console.error(new Error('This is an error message with stack.')));
    cy.window().then((w) => w.console.log('This should console.log appear.'));
    cy.window().then((w) => w.console.log({this: 'Is an object', with: {keys: 12512}}));
    cy.window().then((w) => w.console.info('This should console.info appear.'));
    cy.window().then((w) => w.console.debug('This should console.debug appear.'));

    // Stub a response to PUT comments/ ****
    cy.route({
      method: 'PUT',
      url: 'comments/*',
      status: 404,
      response: {error: message},
      delay: 500,
    }).as('putComment');

    // we have code that puts a comment when
    // the button is clicked in scripts.js
    cy.get('.network-put').click();

    cy.wait('@putComment');

    // our 404 statusCode logic in scripts.js executed
    cy.get('.network-put-comment').should('contain', message);
    cy.get('.breaking-get', {timeout: 1});
  });
});
