import { w2grid }   from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import { w2utils }  from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import { w2form }   from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import { w2layout } from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import * as w2ui    from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'

export default {
    vars: {
        loggedIn:                   false,
        layout:                     null,
        passwordForm:               null,
        toolbar:                    null,
        mainMenuOptionSelected:     "home"
    },
    ui: {
        loadHeader: async function (tau) {
            tau.vars.toolbar = new w2ui.w2toolbar({
                name : 'myToolbar',
                items: [
                    { type: 'button',  id: 'home', text: 'Home', img: 'icon-add' },
                    { type: 'button',  id: 'positions', text: 'Positions', img: 'icon-add' },
                    { type: 'break' },
                    { type: 'menu',   id: 'item2', text: 'Drop Down', img: 'icon-folder',
                        items: [
                            { text: 'Item 1', img: 'icon-page' },
                            { text: 'Item 2', img: 'icon-page' },
                            { text: 'Item 3', img: 'icon-page' }
                        ]
                    },
                    { type: 'break' },
                    { type: 'radio',  id: 'item3',  group: '1', text: 'Radio 1', img: 'icon-page' },
                    { type: 'radio',  id: 'item4',  group: '1', text: 'Radio 2', img: 'icon-page' },
                    { type: 'spacer' },
                ],
                onClick: async function(event) {
                    console.log('Button clicked:', event.target);
                    // Handle specific button clicks
                    switch (event.target) {
                        case 'home':
                            tau.vars.mainMenuOptionSelected = "home"
                            await tau.ui.refreshAllUi(tau)
                            break;
                        case 'positions':
                            tau.vars.mainMenuOptionSelected = "positions"
                            await tau.ui.refreshAllUi(tau)
                            break;
                        case 'logout':
                            alert('Logging out...');
                            break;
                        default:
                            console.log('Unknown button clicked');
                    }
                }
            })
            tau.vars.layout.html("top", tau.vars.toolbar);
            if (tau.vars.loggedIn) {
                tau.vars.toolbar.items.push({ type: 'button',  id: 'logout',  text: 'Logout', img: 'icon-save' })
            }

            for (let item of tau.vars.toolbar.items) {
                if (tau.vars.mainMenuOptionSelected == item.id) {
                    item.checked = true
                } else {
                    item.checked = false
                }
            }

        },
        refreshAllUi: async function (tau) {
            await tau.ui.clearUi(tau)
            await tau.ui.loadHeader(tau)
            if (tau.vars.mainMenuOptionSelected == "home") {

            } else {
                await tau.ui.loadPositionsForm(tau)
            }
            if (!tau.vars.loggedIn) {
                await tau.ui.loadLoginForm(tau)
            }
        },
        clearUi: async function (tau) {
            tau.vars.layout.html("main", "")
        },
        loadLoginForm: async function (tau) {
            tau.vars.passwordForm = new w2form({
                name: 'passwordForm',
                fields: [
                    {
                        field: 'password_prompt',
                        type: 'custom',
                        html:
                            {
                                label: 'Enter your password',
                            }
                    }
                    ,
                    {
                        field: 'password',
                        type: 'password',
                        required: true,
                        html: {label: 'Password'}
                    },
                    {
                        field: 'error_field',
                        type: 'custom',
                        html:
                            {
                                label: '',
                            }
                    }

                ],
                actions: {
                    submit: async function () {
                        const formData = this.record;
                        let ret = await tau.helpers.getFromYazzReturnJson("login", {password: formData.password})
                        if (ret.loggedIn) {
                            tau.vars.loggedIn = true
                            console.log("Logged in")
                            tau.vars.layout.html("main", "");
                            await tau.ui.refreshAllUi(tau)
                        } else {
                            console.log("Wrong password")
                            tau.vars.passwordForm.setValue("error_field","<div style='color: red;'>Wrong password</div>")
                        }
                    }
                }
            });
            tau.vars.layout.html("main", tau.vars.passwordForm);
        },
        loadPositionsForm: async function (tau) {
            tau.vars.passwordForm = new w2form({
                name: 'passwordForm',
                fields: [
                    {
                        field: 'password_prompt',
                        type: 'custom',
                        html:
                            {
                                label: 'Enter your password',
                            }
                    }
                    ,
                    {
                        field: 'password',
                        type: 'password',
                        required: true,
                        html: {label: 'Password'}
                    },
                    {
                        field: 'error_field',
                        type: 'custom',
                        html:
                            {
                                label: '',
                            }
                    }

                ],
                actions: {
                    submit: async function () {
                        const formData = this.record;
                        let ret = await tau.helpers.getFromYazzReturnJson("login", {password: formData.password})
                        if (ret.loggedIn) {
                            tau.vars.loggedIn = true
                            console.log("Logged in")
                            tau.vars.layout.html("main", "");
                            await tau.ui.refreshAllUi(tau)
                        } else {
                            console.log("Wrong password")
                            tau.vars.passwordForm.setValue("error_field","<div style='color: red;'>Wrong password</div>")
                        }
                    }
                }
            });
            tau.vars.layout.html("main", tau.vars.passwordForm);
        },
        loadMainLayout: async function (tau) {
            let pstyle = 'border: 1px solid #efefef; padding: 5px'
            tau.vars.layout = new w2layout({
                box: '#w2ui_layout_html_element',
                name: 'layout',
                panels: [
                    {type: 'top', size: 50, style: pstyle, html: ''},
                    {type: 'left', size: 200, style: pstyle, html: 'left'},
                    {type: 'main', style: pstyle, html: 'main'}
                ]
            })
            tau.vars.layout.render()
        }
    },
    main:                               async function(  )          {
        let tau = this
        await tau.ui.loadMainLayout(tau)
        await tau.ui.refreshAllUi(tau)
    },
    helpers: {
        getFromYazzReturnJson:              async function              (  urlToget  ,  urlParams  )    {
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
        isValidObject:                      function                    (  variable  )                  {
            if ((typeof variable !== 'undefined') && (variable != null)) {
                return true
            }
            return false
        }
    }
}





