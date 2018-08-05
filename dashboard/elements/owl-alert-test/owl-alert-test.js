(function () {
    'use strict';

    class OwlAlertTest extends Polymer.Element {
        static get is() {
            return 'owl-alert-test';
        }

        ready() {
            super.ready();
        }

        testFollow() {
            nodecg.sendMessage('new-follow', this.username);
        }
    }
    customElements.define(OwlAlertTest.is, OwlAlertTest);
})();