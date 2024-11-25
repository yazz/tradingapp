import { w2grid }   from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import { w2utils }  from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import { w2form }   from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import { w2layout } from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'
import * as w2ui    from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'

const $ = window.jQuery;

export default {
    vars:   {
        loggedIn:                   false,
        layout:                     null,
        passwordForm:               null,
        toolbar:                    null,
        mainMenuOptionSelected:     "home",
        debugMode:                  false
    },
    ui:     {
        loadHeader:                         async function (  tau  ) {
            tau.vars.toolbar = new w2ui.w2toolbar({
                name : 'myToolbar',
                items: [
                    { type: 'button',  id: 'home',      text: 'Home',       img: 'icon-add' },
                    { type: 'button',  id: 'positions', text: 'Positions',  img: 'icon-add' },
                    { type: 'button',  id: 'processes', text: 'Processes',  img: 'icon-add' },
                    { type: 'button',  id: 'crypto',    text: 'Crypto',     img: 'icon-add' },
                    { type: 'break' },
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
                        case 'processes':
                            tau.vars.mainMenuOptionSelected = "processes"
                            await tau.ui.refreshAllUi(tau)
                            break;
                        case 'crypto':
                            tau.vars.mainMenuOptionSelected = "crypto"
                            await tau.ui.refreshAllUi(tau)
                            break;
                        case 'logout':
                            await tau.ui.logout(tau)
                            break;
                        default:
                            console.log('Unknown button clicked');
                    }
                }
            })
            tau.vars.layout.html("top", tau.vars.toolbar);

            if (tau.vars.debugMode) {
                tau.vars.toolbar.items.push({ type: 'button',  id: 'debugMode',  text: 'DEDBUG MODE ON', img: 'icon-save' })
            }
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
        refreshAllUi:                       async function (  tau  ) {
            await tau.ui.clearUi(tau)
            await tau.ui.loadHeader(tau)
            if (tau.vars.mainMenuOptionSelected == "home") {
                await tau.ui.loadHomeForm(tau)
            } else if (tau.vars.mainMenuOptionSelected == "positions") {
                await tau.ui.loadPositionsForm(tau)
            } else if (tau.vars.mainMenuOptionSelected == "processes") {
                await tau.ui.loadProcessesForm(tau)
            } else if (tau.vars.mainMenuOptionSelected == "positions") {
                await tau.ui.loadPositionsForm(tau)
            } else if (tau.vars.mainMenuOptionSelected == "crypto") {
                await tau.ui.loadCryptoCalc(tau)
            }
            if (!tau.vars.loggedIn) {
                await tau.ui.loadLoginForm(tau)
            }
        },
        clearUi:                            async function (  tau  ) {
            tau.vars.layout.html("main", "")
        },
        logout:                             async function (  tau  ) {
            tau.vars.loggedIn = false
            await tau.ui.refreshAllUi(tau)
        },
        loadCryptoCalc:                     async function (  tau  ) {
            let cryptoForm = new w2ui.w2form({
                name: 'cryptoCalcForm',
                fields: [
                    {
                        field: 'output',
                        type: 'custom',
                        html:
                            {
                                html: '<div id="customFieldDiv">Initial Value</div>',
                            }
                    }
                    ,
                    {
                        field: 'token_supply',
                        type: 'text',
                        required: true,
                        html: {label: 'Token Supply'}
                    }
                    ,
                    {
                        field: 'sell_amount_tokens',
                        type: 'text',
                        required: true,
                        html: {label: 'Sell Amount Tokens'}
                    }
                    ,
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
                    Calc: async function() {
                        let outText       = "# tokens   $USD/tok  Sell #   TOTAL USD   MARKET Val   sell all"
                        outText = outText + "\n"
                        outText = outText + "--------   --------  ------   ---------   ----------   --------"
                        let numberOfCoins = parseInt(this.record.token_supply)
                        let pr=0.01
                        let maxTries = 100
                        let tries = 0
                        let sellAmountOfCoins = parseInt(this.sell_amount_tokens)
                        let tot = 0
                        let totVal = 0
                        while ((numberOfCoins > 1 )&& (tries < maxTries)){
                            tries ++
                            sellAmountOfCoins = sellAmountOfCoins * 1.00
                            numberOfCoins = (numberOfCoins - sellAmountOfCoins)
                            if (numberOfCoins < 0 ) {
                                sellAmountOfCoins = sellAmountOfCoins + numberOfCoins
                                numberOfCoins = 0
                            }
                            numberOfCoins = numberOfCoins.toFixed(0)
                            sellAmountOfCoins = sellAmountOfCoins.toFixed(0)
                            pr = pr + 0.01 //(pr * 1.1).toFixed(3)
                            tot = tot + (pr * sellAmountOfCoins)
                            totVal = (pr * numberOfCoins)
                            outText = outText + "\n"
                            outText = outText + ("" + numberOfCoins).padEnd(10) +
                                " " +
                                ("" + ((pr * 100).toFixed(0)/100) ).padEnd(10) +
                                ("" + sellAmountOfCoins).padEnd(7) +
                                "  " + tot.toFixed(0).padEnd(10) +
                                "  " + totVal.toFixed(0).padEnd(12) +
                                "  " + (totVal+tot).toFixed(0).padEnd(10)
                        }

                        $('#customFieldDiv').html(outText)
                    }
                }
            })
            cryptoForm.record.token_supply = 700000;
            cryptoForm.record.sell_amount_tokens = 10000;
            tau.vars.layout.html("main", cryptoForm);
        },
        loadProcessesForm:                  async function (  tau  ) {
            let processesForm = new w2ui.w2form({
                name: 'myForm',
                fields: [
                ],
                actions: {
                    GetPrices: async function() {
                        let ret = await tau.helpers.httpGetReturnJson("run_get_prices", {})
                    }
                }
            })
            tau.vars.layout.html("main", processesForm);
        },
        loadLoginForm:                      async function (  tau  ) {
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
                        let ret = await tau.helpers.httpGetReturnJson("login", {password: formData.password})
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
        loadHomeForm:                       async function (  tau  ) {
            tau.vars.layout.html("main", "<h1>Welcome to the trading app! </h1>");
        },
        loadPositionsForm:                  async function (  tau  )                                    {
            let grid = new w2ui.w2grid({
                name: 'grid',
                box: '#grid',
                columns: [
                    { field: 'fname', text: 'First Name', size: '30%' },
                    { field: 'lname', text: 'Last Name', size: '30%' },
                    { field: 'email', text: 'Email', size: '40%' },
                    { field: 'sdate', text: 'Start Date', size: '120px' }
                ],
                records: [
                    { recid: 1, fname: 'John', lname: 'Doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
                    { recid: 2, fname: 'Stuart', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
                    { recid: 3, fname: 'Jin', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
                    { recid: 4, fname: 'Susan', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
                    { recid: 5, fname: 'Kelly', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
                    { recid: 6, fname: 'Francis', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
                    { recid: 7, fname: 'Mark', lname: 'Welldo', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
                    { recid: 8, fname: 'Thomas', lname: 'Bahh', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
                    { recid: 9, fname: 'Sergei', lname: 'Rach', email: 'jdoe@gmail.com', sdate: '4/3/2012' }
                ]
            })
            tau.vars.layout.html("main", grid);
        },
        loadMainLayout:                     async function (  tau  )                                    {
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
    server: {
        loadInitSettings:                   async function (  tau  ) {
            let ret = await tau.helpers.httpGetReturnJson("get_init_settings")
            if (ret.value.debug) {
                tau.vars.debugMode = ret.value.debug
            }
        }
    },
    main:                                   async function              (  )                            {
        let tau = this
        //debugger
        await tau.server.loadInitSettings(tau)
        await tau.ui.loadMainLayout(tau)
        await tau.ui.refreshAllUi(tau)
    },
    helpers: {
        httpGetReturnJson:              async function              (urlToget  , urlParams  )    {
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





