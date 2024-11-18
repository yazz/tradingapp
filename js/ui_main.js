import { w2grid } from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import { w2utils } from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import { w2form } from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import { w2layout } from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'

export default {
    vars: {
        loggedIn: false
    },
    main:                               async function() {
        let ta = this
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
                submit: async function () {
                    const formData = this.record;
                    let ret = await ta.getFromYazzReturnJson("login", {password: formData.password})
                    if (ret.loggedIn) {
                        ta.vars.loggedIn = true
                        console.log("Logged in")
                    } else {
                        console.log("Wrong password")
                    }
                }
            }
        });
        // Render the form
        passwordForm.render();


        let pstyle = 'border: 1px solid #efefef; padding: 5px'
        new w2layout({
            box: '#layout',
            name: 'layout',
            panels: [
                { type: 'top', size: 50, style: pstyle, html: 'top' },
                { type: 'left', size: 200, style: pstyle, html: 'left' },
                { type: 'main', style: pstyle, html: 'main' }
            ]
        })
    },
    getFromYazzReturnJson:              async function              (  urlToget  ,  urlParams  ) {
        let urlParamsWithoutNulls = {}
        if (urlParams) {
            for (let paramItemKey of Object.keys(urlParams)) {
                if (this.isValidObject(urlParams[paramItemKey])) {
                    urlParamsWithoutNulls[  paramItemKey  ] = urlParams[paramItemKey]
                }
            }
        }
        let openfileurl = "http://127.0.0.1:3000/" + urlToget + "?" +
            new URLSearchParams(urlParamsWithoutNulls)

        let promise = new Promise(async function (returnfn) {
            fetch(openfileurl, {
                method: 'get',
                credentials: "include"
            })
                .then((response) => response.json())
                .then(async function (responseJson) {
                    returnfn(responseJson)
                })
                .catch(err => {
                    //error block
                    returnfn()
                })
        })
        let retval = await promise
        return retval
    },
    isValidObject:                      function                    (   variable   )                                {
        if ((typeof variable !== 'undefined') && (variable != null)) {
            return true
        }
        return false
    }
}
