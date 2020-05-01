// Lambda Function code for Alexa.
// Best saample template 





const Alexa = require("ask-sdk-core");
const Aws = require("aws-sdk");
const i18n = require('i18next');

Aws.config.update({
  region: "us-east-2"
});
var docClient = new Aws.DynamoDB.DocumentClient();

var table = "shoppingCart";
var params;
var x = [];
var y=[];





const invocationName = "smart cart";

// Session Attributes 
//   Alexa will track attributes for you, by default only during the lifespan of your session.
//   The history[] array will track previous request(s), used for contextual Help/Yes/No handling.
//   Set up DynamoDB persistence to have the skill save and reload these attributes between skill sessions.

function getMemoryAttributes() {   
    const memoryAttributes = {
       "history":[],


       "launchCount":0,
       "lastUseTimestamp":0,

       "lastSpeechOutput":{},
       // "nextIntent":[]

       // "favoriteColor":"",
       // "name":"",
       // "namePronounce":"",
       // "email":"",
       // "mobileNumber":"",
       // "city":"",
       // "state":"",
       // "postcode":"",
       // "birthday":"",
       // "bookmark":0,
       // "wishlist":[],
   };
   return memoryAttributes;
};

const maxHistorySize = 20; // remember only latest 20 intents 


// 1. Intent Handlers =============================================

const AMAZON_FallbackIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.FallbackIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let previousSpeech = getPreviousSpeechOutput(sessionAttributes);

        return responseBuilder
            .speak('Sorry I didnt catch what you said, ' + stripSpeak(previousSpeech.outputSpeech))
            .reprompt(stripSpeak(previousSpeech.reprompt))
            .getResponse();
    },
};

const AMAZON_CancelIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_HelpIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let history = sessionAttributes['history'];
        let intents = getCustomIntents();
        let sampleIntent = randomElement(intents);

        let say = 'You asked for help. '; 

        let previousIntent = getPreviousIntent(sessionAttributes);
        if (previousIntent && !handlerInput.requestEnvelope.session.new) {
             say += 'Your last intent was ' + previousIntent + '. ';
         }
        // say +=  'I understand  ' + intents.length + ' intents, '

        say += ' Here something you can ask me, ' + getSampleUtterance(sampleIntent);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_StopIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const addIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'addIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = '';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots); 
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: qt 
        if (slotValues.qt.heardAs && slotValues.qt.heardAs !== '') {
            slotStatus += '';
        } else {
            slotStatus += '';
        }
        if (slotValues.qt.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += '';
            if(slotValues.qt.resolved !== slotValues.qt.heardAs) {
                slotStatus += ''; 
                } else {
                slotStatus += ''
            } // else {
                //
        }
        if (slotValues.qt.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += '';
            console.log('***** consider adding "' + slotValues.qt.heardAs + '" to the custom slot type used by slot qt! '); 
        }

        if( (slotValues.qt.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.qt.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('addIntent','qt'), 'or');
        }
        //   SLOT: mes 
        if (slotValues.mes.heardAs && slotValues.mes.heardAs !== '') {
            slotStatus += '';
        } else {
            slotStatus += '';
        }
        if (slotValues.mes.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.mes.resolved !== slotValues.mes.heardAs) {
                slotStatus += 'synonym for ' + slotValues.mes.resolved + '. '; 
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.mes.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.mes.heardAs + '" to the custom slot type used by slot mes! '); 
        }

        if( (slotValues.mes.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.mes.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('addIntent','mes'), 'or');
        }
        //   SLOT: itemname 
        if (slotValues.itemname.heardAs && slotValues.itemname.heardAs !== '') {
            slotStatus += '  ';
        } else {
            slotStatus += 'slot itemname is empty. ';
        }
        slotStatus += 'You have added '+slotValues.qt.heardAs+' '+slotValues.mes.heardAs+' of '+slotValues.itemname.heardAs;
        say += slotStatus;
        params = {
    TableName:table,
    Item:{
        "name":slotValues.itemname.heardAs,
        "qty":slotValues.qt.heardAs,
        "typ":slotValues.mes.heardAs
        }
    }

// DybamoDB function call

docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 3));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 3));
    }
});

//===================


x.push(slotValues.itemname.heardAs);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const delIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'delIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = '';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots); 
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: qt 
        if (slotValues.qt.heardAs && slotValues.qt.heardAs !== '') {
            slotStatus += '';
        } else {
            slotStatus += '';
        }
        if (slotValues.qt.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += '';
            if(slotValues.qt.resolved !== slotValues.qt.heardAs) {
               // slotStatus += 'synonym for ' + slotValues.qt.resolved + '. '; 
                } else {
                //slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.qt.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            //slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.qt.heardAs + '" to the custom slot type used by slot qt! '); 
        }

        if( (slotValues.qt.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.qt.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('delIntent','qt'), 'or');
        }
        //   SLOT: mes 
        if (slotValues.mes.heardAs && slotValues.mes.heardAs !== '') {
            //slotStatus += ' slot mes was heard as ' + slotValues.mes.heardAs + '. ';
        } else {
            //slotStatus += 'slot mes is empty. ';
        }
        if (slotValues.mes.ERstatus === 'ER_SUCCESS_MATCH') {
            //slotStatus += 'a valid ';
            if(slotValues.mes.resolved !== slotValues.mes.heardAs) {
                //slotStatus += 'synonym for ' + slotValues.mes.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.mes.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            //slotStatus += 'your input did not match any item name ';
            console.log('***** consider adding "' + slotValues.mes.heardAs + '" to the custom slot type used by slot mes! '); 
        }

        if( (slotValues.mes.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.mes.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('delIntent','mes'), 'or');
        }
        //   SLOT: itemname 
        if (slotValues.itemname.heardAs && slotValues.itemname.heardAs !== '') {
            slotStatus += '';
        } else {
            slotStatus += '';
        }
        if (slotValues.itemname.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += '';
            if(slotValues.itemname.resolved !== slotValues.itemname.heardAs) {
                slotStatus +=''; 
                } else {
                slotStatus += ''
            } // else {
                //
        }
        if (slotValues.itemname.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += ' ';
            console.log('***** consider adding "' + slotValues.itemname.heardAs + '" to the custom slot type used by slot itemname! '); 
        }

        if( (slotValues.itemname.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.itemname.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('delIntent','itemname'), 'or');
        }

        slotStatus += 'You have deleted '+slotValues.qt.heardAs+' '+slotValues.mes.heardAs+' of '+slotValues.itemname.heardAs;
        say += slotStatus;


//Dynamo db---
params = {
    TableName:table,
    Key:{
        "name":slotValues.itemname.heardAs
        
    }
};
// Call DynamoDB to delete the item from the table
console.log("Attempting a conditional delete...");
docClient.delete(params, function(err, data) {
    if (err) {
        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 3));
    } else {
        console.log("DeleteItem succeeded:", JSON.stringify(data, null, 3));
    }
});
//===================================================

x=x.filter(e => e !== slotValues.itemname.heardAs); 

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const listIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'listIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'List of all your items are. ';
        var i;
        for(i=0;i<x.length;i++){
            say +=' , '+x[i];
        }

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const checkIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'checkIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Thank You, your shopping list will be send to the nearby Grocery store & the items will be delivered in time to our home. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const nameIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'nameIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

       let say="";

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots); 
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: name 
        if (slotValues.name.heardAs && slotValues.name.heardAs !== '') {
            slotStatus += 'Hi ' + slotValues.name.heardAs + '. ';
        } else {
            slotStatus += 'slot name is empty. ';
        }
        if (slotValues.name.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += ' ';
            if(slotValues.name.resolved !== slotValues.name.heardAs) {
                slotStatus += 'You can ask me to Add ,delete,list follwed by itemname.'; 
                } else {
                slotStatus += 'You can ask me to Add ,delete,list follwed by itemname. ';
            } // else {
                //
        }
        if (slotValues.name.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'You can ask me to Add ,delete,list follwed by itemname. ';
            console.log('***** consider adding "' + slotValues.name.heardAs + '" to the custom slot type used by slot name! '); 
        }

        if( (slotValues.name.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.name.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('nameIntent','name'), 'or');
        }

        say += slotStatus;
       var adr = 'alexashopper.000webhostapp.com/test.php';


/*The parse method returns an object containing url properties*/


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LaunchRequest_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;

        let say = 'Hello' + ' and Welcome to ' + invocationName + ' ! I am your voice cart , Lets start from your name';

        let skillTitle = capitalize(invocationName);


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .withStandardCard('Welcome!', 
              'Hello!\nThis is a card for your skill, ' + skillTitle,
               welcomeCardImg.smallImageUrl, welcomeCardImg.largeImageUrl)
            .getResponse();
    },
};

const SessionEndedHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler =  {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;

        console.log(`Error handled: ${error.message}`);
        // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

        return handlerInput.responseBuilder
            .speak(`Sorry, your skill got this error.  ${error.message} `)
            .reprompt(`Sorry, your skill got this error.  ${error.message} `)
            .getResponse();
    }
};

// 2. Constants ===========================================================================

    //    Here you can define static data, to be used elsewhere in your code.  For example: 
    //    const myString = "Hello World";
    //    const myArray  = [ "orange", "grape", "strawberry" ];
    //    const myObject = { "city": "Boston",  "state":"Massachusetts" };

const APP_ID = undefined;  // TODO replace with your Skill ID (OPTIONAL).

// 3.  Helper Functions ===================================================================

function capitalize(myString) {

     return myString.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }) ;
}

 
function randomElement(myArray) { 
    return(myArray[Math.floor(Math.random() * myArray.length)]); 
} 
 
function stripSpeak(str) { 
    return(str.replace('<speak>', '').replace('</speak>', '')); 
} 
 
 
 
 
function getSlotValues(filledSlots) { 
    const slotValues = {}; 
 
    Object.keys(filledSlots).forEach((item) => { 
        const name  = filledSlots[item].name; 
 
        if (filledSlots[item] && 
            filledSlots[item].resolutions && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0] && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) { 
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) { 
                case 'ER_SUCCESS_MATCH': 
                    slotValues[name] = { 
                        heardAs: filledSlots[item].value, 
                        resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name, 
                        ERstatus: 'ER_SUCCESS_MATCH' 
                    }; 
                    break; 
                case 'ER_SUCCESS_NO_MATCH': 
                    slotValues[name] = { 
                        heardAs: filledSlots[item].value, 
                        resolved: '', 
                        ERstatus: 'ER_SUCCESS_NO_MATCH' 
                    }; 
                    break; 
                default: 
                    break; 
            } 
        } else { 
            slotValues[name] = { 
                heardAs: filledSlots[item].value || '', // may be null 
                resolved: '', 
                ERstatus: '' 
            }; 
        } 
    }, this); 
 
    return slotValues; 
} 
 
function getExampleSlotValues(intentName, slotName) { 
 
    let examples = []; 
    let slotType = ''; 
    let slotValuesFull = []; 
 
    let intents = model.interactionModel.languageModel.intents; 
    for (let i = 0; i < intents.length; i++) { 
        if (intents[i].name == intentName) { 
            let slots = intents[i].slots; 
            for (let j = 0; j < slots.length; j++) { 
                if (slots[j].name === slotName) { 
                    slotType = slots[j].type; 
 
                } 
            } 
        } 
 
    } 
    let types = model.interactionModel.languageModel.types; 
    for (let i = 0; i < types.length; i++) { 
        if (types[i].name === slotType) { 
            slotValuesFull = types[i].values; 
        } 
    } 
 
    slotValuesFull = shuffleArray(slotValuesFull); 
 
    examples.push(slotValuesFull[0].name.value); 
    examples.push(slotValuesFull[1].name.value); 
    if (slotValuesFull.length > 2) { 
        examples.push(slotValuesFull[2].name.value); 
    } 
 
 
    return examples; 
} 
 
function sayArray(myData, penultimateWord = 'and') { 
    let result = ''; 
 
    myData.forEach(function(element, index, arr) { 
 
        if (index === 0) { 
            result = element; 
        } else if (index === myData.length - 1) { 
            result += ` ${penultimateWord} ${element}`; 
        } else { 
            result += `, ${element}`; 
        } 
    }); 
    return result; 
} 
function supportsDisplay(handlerInput) // returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.) 
{                                      //  Enable your skill for display as shown here: https://alexa.design/enabledisplay 
    const hasDisplay = 
        handlerInput.requestEnvelope.context && 
        handlerInput.requestEnvelope.context.System && 
        handlerInput.requestEnvelope.context.System.device && 
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces && 
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display; 
 
    return hasDisplay; 
} 
 
 
const welcomeCardImg = { 
    smallImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane720_480.png", 
    largeImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane1200_800.png" 
 
 
}; 
 
const DisplayImg1 = { 
    title: 'Jet Plane', 
    url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png' 
}; 
const DisplayImg2 = { 
    title: 'Starry Sky', 
    url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png' 
 
}; 
 
function getCustomIntents() { 
    const modelIntents = model.interactionModel.languageModel.intents; 
 
    let customIntents = []; 
 
 
    for (let i = 0; i < modelIntents.length; i++) { 
 
        if(modelIntents[i].name.substring(0,7) != "AMAZON." && modelIntents[i].name !== "LaunchRequest" ) { 
            customIntents.push(modelIntents[i]); 
        } 
    } 
    return customIntents; 
} 
 
function getSampleUtterance(intent) { 
 
    return randomElement(intent.samples); 
 
} 
 
function getPreviousIntent(attrs) { 
 
    if (attrs.history && attrs.history.length > 1) { 
        return attrs.history[attrs.history.length - 2].IntentRequest; 
 
    } else { 
        return false; 
    } 
 
} 
 
function getPreviousSpeechOutput(attrs) { 
 
    if (attrs.lastSpeechOutput && attrs.history.length > 1) { 
        return attrs.lastSpeechOutput; 
 
    } else { 
        return false; 
    } 
 
} 
 
function timeDelta(t1, t2) { 
 
    const dt1 = new Date(t1); 
    const dt2 = new Date(t2); 
    const timeSpanMS = dt2.getTime() - dt1.getTime(); 
    const span = { 
        "timeSpanMIN": Math.floor(timeSpanMS / (1000 * 60 )), 
        "timeSpanHR": Math.floor(timeSpanMS / (1000 * 60 * 60)), 
        "timeSpanDAY": Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)), 
        "timeSpanDesc" : "" 
    }; 
 
 
    if (span.timeSpanHR < 2) { 
        span.timeSpanDesc = span.timeSpanMIN + " minutes"; 
    } else if (span.timeSpanDAY < 2) { 
        span.timeSpanDesc = span.timeSpanHR + " hours"; 
    } else { 
        span.timeSpanDesc = span.timeSpanDAY + " days"; 
    } 
 
 
    return span; 
 
} 
 
 
const InitMemoryAttributesInterceptor = { 
    process(handlerInput) { 
        let sessionAttributes = {}; 
        if(handlerInput.requestEnvelope.session['new']) { 
 
            sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
 
            let memoryAttributes = getMemoryAttributes(); 
 
            if(Object.keys(sessionAttributes).length === 0) { 
 
                Object.keys(memoryAttributes).forEach(function(key) {  // initialize all attributes from global list 
 
                    sessionAttributes[key] = memoryAttributes[key]; 
 
                }); 
 
            } 
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
 
        } 
    } 
}; 
 
const RequestHistoryInterceptor = { 
    process(handlerInput) { 
 
        const thisRequest = handlerInput.requestEnvelope.request; 
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
 
        let history = sessionAttributes['history'] || []; 
 
        let IntentRequest = {}; 
        if (thisRequest.type === 'IntentRequest' ) { 
 
            let slots = []; 
 
            IntentRequest = { 
                'IntentRequest' : thisRequest.intent.name 
            }; 
 
            if (thisRequest.intent.slots) { 
 
                for (let slot in thisRequest.intent.slots) { 
                    let slotObj = {}; 
                    slotObj[slot] = thisRequest.intent.slots[slot].value; 
                    slots.push(slotObj); 
                } 
 
                IntentRequest = { 
                    'IntentRequest' : thisRequest.intent.name, 
                    'slots' : slots 
                }; 
 
            } 
 
        } else { 
            IntentRequest = {'IntentRequest' : thisRequest.type}; 
        } 
        if(history.length > maxHistorySize - 1) { 
            history.shift(); 
        } 
        history.push(IntentRequest); 
 
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
    } 
 
}; 
 
 
 
 
const RequestPersistenceInterceptor = { 
    process(handlerInput) { 
 
        if(handlerInput.requestEnvelope.session['new']) { 
 
            return new Promise((resolve, reject) => { 
 
                handlerInput.attributesManager.getPersistentAttributes() 
 
                    .then((sessionAttributes) => { 
                        sessionAttributes = sessionAttributes || {}; 
 
 
                        sessionAttributes['launchCount'] += 1; 
 
                        handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
                        handlerInput.attributesManager.savePersistentAttributes() 
                            .then(() => { 
                                resolve(); 
                            }) 
                            .catch((err) => { 
                                reject(err); 
                            }); 
                    }); 
 
            }); 
 
        } // end session['new'] 
    } 
}; 
 
 
const ResponseRecordSpeechOutputInterceptor = { 
    process(handlerInput, responseOutput) { 
 
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
        let lastSpeechOutput = { 
            "outputSpeech":responseOutput.outputSpeech.ssml, 
            "reprompt":responseOutput.reprompt.outputSpeech.ssml 
        }; 
 
        sessionAttributes['lastSpeechOutput'] = lastSpeechOutput; 
 
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
    } 
}; 
 
const ResponsePersistenceInterceptor = { 
    process(handlerInput, responseOutput) { 
 
        const ses = (typeof responseOutput.shouldEndSession == "undefined" ? true : responseOutput.shouldEndSession); 
 
        if(ses || handlerInput.requestEnvelope.request.type == 'SessionEndedRequest') { // skill was stopped or timed out 
 
            let sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
 
            sessionAttributes['lastUseTimestamp'] = new Date(handlerInput.requestEnvelope.request.timestamp).getTime(); 
 
            handlerInput.attributesManager.setPersistentAttributes(sessionAttributes); 
 
            return new Promise((resolve, reject) => { 
                handlerInput.attributesManager.savePersistentAttributes() 
                    .then(() => { 
                        resolve(); 
                    }) 
                    .catch((err) => { 
                        reject(err); 
                    }); 
 
            }); 
 
        } 
 
    } 
}; 
 
 
function shuffleArray(array) {  // Fisher Yates shuffle! 
 
    let currentIndex = array.length, temporaryValue, randomIndex; 
 
    while (0 !== currentIndex) { 
 
        randomIndex = Math.floor(Math.random() * currentIndex); 
        currentIndex -= 1; 
 
        temporaryValue = array[currentIndex]; 
        array[currentIndex] = array[randomIndex]; 
        array[randomIndex] = temporaryValue; 
    } 
 
    return array; 
} 
// 4. Exports handler function and setup =======================
const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
    .addRequestHandlers(
        AMAZON_FallbackIntent_Handler, 
        AMAZON_CancelIntent_Handler, 
        AMAZON_HelpIntent_Handler, 
        AMAZON_StopIntent_Handler, 
        addIntent_Handler, 
        delIntent_Handler, 
        listIntent_Handler, 
        checkIntent_Handler, 
        nameIntent_Handler, 
        LaunchRequest_Handler, 
        SessionEndedHandler
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(InitMemoryAttributesInterceptor)
    .addRequestInterceptors(RequestHistoryInterceptor)

    .addResponseInterceptors(ResponseRecordSpeechOutputInterceptor)

 .addRequestInterceptors(RequestPersistenceInterceptor)
 .addResponseInterceptors(ResponsePersistenceInterceptor)

 .withTableName("askMemorySkillTable")
  .withAutoCreateTable(true)

    .lambda();

// Front end just for reference 

const model = {
  "interactionModel": {
    "languageModel": {
      "invocationName": "smart cart",
      "intents": [
        {
          "name": "AMAZON.FallbackIntent",
          "samples": []
        },
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "addIntent",
          "slots": [
            {
              "name": "qt",
              "type": "quantity"
            },
            {
              "name": "mes",
              "type": "mesurment"
            },
            {
              "name": "itemname",
              "type": "itemNameSlot"
            }
          ],
          "samples": [
            "add {qt} {mes} {itemname} ",
            "add {qt} {mes} {itemname} to cart",
            "add {qt} {mes} {itemname} to my cart"
          ]
        },
        {
          "name": "delIntent",
          "slots": [
            {
              "name": "qt",
              "type": "quantity"
            },
            {
              "name": "mes",
              "type": "mesurment"
            },
            {
              "name": "itemname",
              "type": "itemNameSlot"
            }
          ],
          "samples": [
            "delete {qt} {mes} {itemname} to cart",
            "delete {qt} {mes} {itemname} to my cart",
            "delete {qt} {mes} {itemname} "
          ]
        },
        {
          "name": "listIntent",
          "slots": [],
          "samples": [
            "say all items",
            "say all item",
            "list all items",
            "list all item"
          ]
        },
        {
          "name": "checkIntent",
          "slots": [],
          "samples": [
            "do checkout",
            "buy all",
            "check items"
          ]
        },
        {
          "name": "nameIntent",
          "slots": [
            {
              "name": "name",
              "type": "nameSlot"
            }
          ],
          "samples": [
            "{name}",
            "myself {name}",
            "I am {name}",
            "my name is {name}"
          ]
        },
        {
          "name": "LaunchRequest"
        }
      ],
      "types": [
        {
          "name": "quantity",
          "values": [
            {
              "name": {
                "value": "twenty two"
              }
            },
            {
              "name": {
                "value": "thirteen"
              }
            },
            {
              "name": {
                "value": "fourty four"
              }
            },
            {
              "name": {
                "value": "three"
              }
            },
            {
              "name": {
                "value": "two"
              }
            }
          ]
        },
        {
          "name": "mesurment",
          "values": [
            {
              "name": {
                "value": "grams"
              }
            },
            {
              "name": {
                "value": "pound"
              }
            },
            {
              "name": {
                "value": "litre"
              }
            },
            {
              "name": {
                "value": "kg"
              }
            }
          ]
        },
        {
          "name": "itemNameSlot",
          "values": [
            {
              "name": {
                "value": "egg"
              }
            },
            {
              "name": {
                "value": "rice"
              }
            },
            {
              "name": {
                "value": "bread"
              }
            }
          ]
        },
        {
          "name": "nameSlot",
          "values": [
            {
              "name": {
                "value": "chandan kumar mishra"
              }
            },
            {
              "name": {
                "value": "chandan"
              }
            },
            {
              "name": {
                "value": "chandan mishra"
              }
            }
          ]
        }
      ]
    }
  }
};