// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require("ask-sdk-core");
const { timeTable } = require("./objects");
const {
    determineLeapYear,
    getNextStory,
    checkAnswer,
    checkNum,
    getHttp,
} = require("./functions");
const moveInDate = new Date("July 15, 2020 09:00:00");

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) ===
            "LaunchRequest"
        );
    },
    handle(handlerInput) {
        const speakOutput =
            "Hello! Welcome to Andrew and Cindy's Vitagraph apartment.";
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    },
};
const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) ===
                "IntentRequest" &&
            Alexa.getIntentName(handlerInput.requestEnvelope) ===
                "HelloWorldIntent"
        );
    },
    handle(handlerInput) {
        const speakOutput = "Hello World!";
        return (
            handlerInput.responseBuilder
                .speak(speakOutput)
                //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                .getResponse()
        );
    },
};

const LivingDurationIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) ===
                "IntentRequest" &&
            Alexa.getIntentName(handlerInput.requestEnvelope) ===
                "LivingDurationIntent"
        );
    },
    handle(handlerInput) {
        const currentDate = new Date();
        const whichYear = currentDate.getFullYear();
        let dayDiff =
            Math.abs(currentDate - moveInDate) / (1000 * 60 * 60 * 24);
        let dateDiff = 0;
        let mt1 = parseInt(Math.floor(dayDiff / 30), 10);
        let monthOrMonths = "";
        let yr1 = 0;
        let yearBool = false;
        let emit1 = "";
        let emit2 = "";
        let isLeapYear = determineLeapYear(whichYear);
        const monthCount = isLeapYear
            ? [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
            : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (mt1 >= 12) {
            yr1 = parseInt(Math.floor(mt1 / 12), 10);
            if (mt1 % 12 === 11) {
                mt1 = 0;
                yr1 += 1;
            } else if (mt1 % 12 === 0) {
                mt1 = mt1 % 12;
            } else {
                mt1 = mt1 % 12;
            }
            yearBool = true;
        }

        monthOrMonths = mt1 > 1 ? "months" : "month";
        dayDiff = Math.floor(dayDiff, 10);
        const dayOrDays = dayDiff > 1 ? "days" : "day";

        if (currentDate.getDate() > 15) {
            dateDiff = currentDate.getDate() - 15;
        } else if (currentDate.getDate() < 15) {
            var dateCountdown =
                currentDate.getMonth() > 0
                    ? monthCount[currentDate.getMonth() - 1]
                    : 31;

            dateDiff = dateCountdown - 15 + currentDate.getDate();
        }

        emit2 = `and ${dateDiff} ${dayOrDays}`;

        const yearOrYears = yr1 > 1 ? "years" : "year";

        if (yearBool) {
            if (mt1 !== 0) {
                emit1 = `You guys have lived here for ${dayDiff} days. Thats ${yr1} ${yearOrYears}, ${mt1} ${monthOrMonths} ${emit2}!`;
            } else {
                emit1 = `You guys have lived here for ${dayDiff} days. Thats ${yr1} ${yearOrYears} ${emit2}!`;
            }
        } else {
            if (mt1 >= 1) {
                emit1 = `You guys have lived here for ${dayDiff} days. Thats ${mt1} ${monthOrMonths} ${emit2}!`;
            } else {
                emit1 = `You guys have lived here for ${dayDiff} days!`;
            }
        }

        if (dayDiff == 365) {
            emit1 = "You guys have lived here for an entire year!!";
        }

        return (
            handlerInput.responseBuilder
                .speak(emit1)
                //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                .getResponse()
        );
    },
};

const StoryIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return (
            request.type === "IntentRequest" &&
            (request.intent.name === "StartStoryIntent" ||
                request.intent.name === "AMAZON.StartOverIntent" ||
                request.intent.name === "AMAZON.YesIntent")
        );
    },
    handle(handlerInput) {
        const story = getNextStory(handlerInput);
        const speechOutput = story.question;
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();
    },
};

const AnswerHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        return (
            request.type === "IntentRequest" &&
            request.intent.name === "AnswerIntent" &&
            attributes.counter < attributes.storiesDeck.length - 1
        );
    },
    handle(handlerInput) {
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        const answerSlot =
            handlerInput.requestEnvelope.request.intent.slots.answer.value;
        const result = checkAnswer(handlerInput, answerSlot);
        const story = getNextStory(handlerInput);
        const speechOutput = `${result.message}Here's your ${
            attributes.counter + 1
        }th question - ${story.question}`;
        attributes.lastResult = result.message;
        handlerInput.attributesManager.setSessionAttributes(attributes);

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();
    },
};

const FinalScoreHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        return (
            request.type === "IntentRequest" &&
            request.intent.name === "AnswerIntent" &&
            attributes.counter == attributes.storiesDeck.length - 1
        );
    },
    handle(handlerInput) {
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        const answerSlot =
            handlerInput.requestEnvelope.request.intent.slots.answer.value;
        checkAnswer(handlerInput, answerSlot);
        const speechOutput = `${attributes.lastResult} Thank you for playing the Doctor Who Challenge! Your final score is ${attributes.correctCount} out of ${attributes.counter}`;
        return handlerInput.responseBuilder.speak(speechOutput).getResponse();
    },
};

const TrainDepartureIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) ===
                "IntentRequest" &&
            Alexa.getIntentName(handlerInput.requestEnvelope) ===
                "TrainDepartureIntent"
        );
    },
    handle(handlerInput) {
        const currentDate = new Date();
        const nyConvert = currentDate.toLocaleString("en-US", {
            timeZone: "America/New_York",
            hour12: false,
        });
        let str = nyConvert.split(", ")[1].slice(0, -3);
        str = str.split("")[1] === ":" ? `0${str}` : str;

        const indx = checkNum(str);
        let counter = 0;

        counter = str === timeTable[indx] ? 1 : 0;

        let time1 = timeTable[indx + counter];
        const time1DayZone =
            parseInt(time1.split(":")[0], 10) >= 12 ? "PM" : "AM";
        time1 =
            parseInt(time1.split(":")[0], 10) >= 13
                ? `${parseInt(time1.split(":")[0], 10) - 12}:${
                      time1.split(":")[1]
                  }`
                : time1;
        let time2 = timeTable[indx + counter + 1];
        const time2DayZone =
            parseInt(time2.split(":")[0], 10) >= 12 ? "PM" : "AM";
        time2 =
            parseInt(time2.split(":")[0], 10) >= 13
                ? `${parseInt(time2.split(":")[0], 10) - 12}:${
                      time2.split(":")[1]
                  }`
                : time2;
        let time3 = timeTable[indx + counter + 2];
        const time3DayZone =
            parseInt(time3.split(":")[0], 10) >= 12 ? "PM" : "AM";
        time3 =
            parseInt(time3.split(":")[0], 10) >= 13
                ? `${parseInt(time3.split(":")[0], 10) - 12}:${
                      time3.split(":")[1]
                  }`
                : time3;

        const speechOut = `The next three Q trains are at ${time1}${time1DayZone}, ${time2}${time2DayZone}, and ${time3}${time3DayZone}.`;

        return handlerInput.responseBuilder.speak(speechOut).getResponse();
    },
};

const DirectionsIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name ===
                "DirectionsIntent"
        );
    },

    async handle(handlerInput) {
        const destination =
            handlerInput.requestEnvelope.request.intent.slots.destination.value;

        try {
            let response = await getHttp(destination);
            response = JSON.parse(response);
            const time = response.routes[0].legs[0].duration_in_traffic
                ? response.routes[0].legs[0].duration_in_traffic.text
                : response.routes[0].legs[0].duration.text;

            const speechOutput = `If you leave right now, it'll take about ${time}.`;

            handlerInput.responseBuilder.speak(speechOutput);
        } catch (error) {
            handlerInput.responseBuilder.speak(
                `I wasn't able to find a fact for ${destination}`
            );
        }

        return handlerInput.responseBuilder.getResponse();
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) ===
                "IntentRequest" &&
            Alexa.getIntentName(handlerInput.requestEnvelope) ===
                "AMAZON.HelpIntent"
        );
    },
    handle(handlerInput) {
        const speakOutput = "You can say hello to me! How can I help?";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) ===
                "IntentRequest" &&
            (Alexa.getIntentName(handlerInput.requestEnvelope) ===
                "AMAZON.CancelIntent" ||
                Alexa.getIntentName(handlerInput.requestEnvelope) ===
                    "AMAZON.StopIntent")
        );
    },
    handle(handlerInput) {
        const speakOutput = "Goodbye!";
        return handlerInput.responseBuilder.speak(speakOutput).getResponse();
    },
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) ===
            "SessionEndedRequest"
        );
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    },
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) ===
            "IntentRequest"
        );
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return (
            handlerInput.responseBuilder
                .speak(speakOutput)
                //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                .getResponse()
        );
    },
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    },
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        LivingDurationIntentHandler,
        StoryIntentHandler,
        AnswerHandler,
        FinalScoreHandler,
        TrainDepartureIntentHandler,
        DirectionsIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
