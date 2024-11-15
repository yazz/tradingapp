import { w2grid } from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import { w2utils } from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import { w2form } from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'

export default {
    main: async function() {
        let passwordForm = new w2form({
            name: 'passwordForm',
            box: '#password-form',
            fields: [
                {
                    field: 'password',
                    type: 'password',
                    required: true,
                    html: { label: 'Password' }
                }
            ],
            actions: {
                submit: function () {
                    const formData = this.record;
                    console.log("Password entered:", formData.password);
                    alert("Password submitted!");
                }
            }
        });

        // Render the form
        passwordForm.render();
    }
}
