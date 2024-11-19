import { w2grid }   from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import { w2utils }  from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import { w2form }   from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import { w2layout } from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import * as w2ui    from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'

export default {
    vars: {
        loggedIn:       false,
        layout:         null,
        passwordForm:   null,
        toolbar:        null
    },
    ui: {
        loadHeader: async function (ta) {
            ta.vars.toolbar = new w2ui.w2toolbar({
                name : 'myToolbar',
                items: [
                    { type: 'check',  id: 'item1', text: 'Check', img: 'icon-add', checked: true },
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
                    { type: 'button',  id: 'item5',  text: 'Item 5', img: 'icon-save' }
                ]
            })
            ta.vars.layout.html("top", ta.vars.toolbar);

        },
        refreshAllUi: async function (ta) {
            await ta.ui.loadHeader(ta)
        },
        loadLoginForm: async function (ta) {
            ta.vars.passwordForm = new w2form({
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
                        let ret = await ta.helpers.getFromYazzReturnJson("login", {password: formData.password})
                        if (ret.loggedIn) {
                            ta.vars.loggedIn = true
                            console.log("Logged in")
                            ta.vars.layout.html("main", "");
                            await ta.ui.refreshAllUi(ta)
                        } else {
                            console.log("Wrong password")
                            ta.vars.passwordForm.setValue("error_field","<div style='color: red;'>Wrong password</div>")
                        }
                    }
                }
            });
            ta.vars.layout.html("main", ta.vars.passwordForm);
        },
        loadMainLayout: async function (ta) {
            let pstyle = 'border: 1px solid #efefef; padding: 5px'
            ta.vars.layout = new w2layout({
                box: '#w2ui_layout_html_element',
                name: 'layout',
                panels: [
                    {type: 'top', size: 50, style: pstyle, html: ''},
                    {type: 'left', size: 200, style: pstyle, html: 'left'},
                    {type: 'main', style: pstyle, html: 'main'}
                ]
            })
            ta.vars.layout.render()
        }
    },
    main:                               async function(  )          {
        let ta = this
        await ta.ui.loadMainLayout(ta)
        await ta.ui.loadLoginForm(ta)
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





