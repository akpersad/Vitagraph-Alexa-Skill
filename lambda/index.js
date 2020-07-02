// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require("ask-sdk-core");
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

const determineLeapYear = (whichYear) => {
    if (whichYear % 4 !== 0) {
        return (isLeapYear = false);
    } else if (whichYear % 100 !== 0) {
        return (isLeapYear = true);
    } else if (whichYear % 400 !== 0) {
        return (isLeapYear = false);
    } else {
        return (isLeapYear = true);
    }
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

const getNextStory = (handlerInput) => {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var storiesDeck = [];

    if (!attributes.counter) {
        //skill launched for first time - no counter set
        storiesDeck = shuffle(stories);
        attributes.storiesDeck = storiesDeck;
        attributes.counter = 0;
        attributes.correctCount = 0;
        attributes.wrongCount = 0;
    } else {
        storiesDeck = attributes.storiesDeck;
    }

    const story = storiesDeck[attributes.counter];
    attributes.lastQuestion = story;
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return story;
};

const checkAnswer = (handlerInput, answerSlot) => {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var status = "";
    var message = "";

    if (attributes.lastQuestion.answer.includes(answerSlot.toLowerCase())) {
        console.log("correct");
        message = "Yup! " + answerSlot + " is correct. ";
        attributes.correctCount += 1;
        status = true;
    } else {
        console.log("wrong");
        message = "Nope! " + answerSlot + " is incorrect. ";
        attributes.wrongCount += 1;
        status = false;
    }
    attributes.counter += 1;
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return { status: status, message: message };
};

const shuffle = (arr) => {
    var ctr = arr.length,
        temp,
        index;
    while (ctr > 0) {
        index = Math.floor(Math.random() * ctr);
        ctr--;
        temp = arr[ctr];
        arr[ctr] = arr[index];
        arr[index] = temp;
    }
    return arr;
};

const stories = [
    {
        question: "Who played the 9th Doctor?",
        answer: ["christopher eccleston", "andrew"],
    },
    {
        question: "Who played the 10th Doctor?",
        answer: ["david tennant", "andrew"],
    },
    {
        question: "Who played the 11th Doctor?",
        answer: ["matt smith", "andrew"],
    },
    {
        question: "Who played the 12th Doctor?",
        answer: ["peter capaldi", "andrew"],
    },
    {
        question: "Who played the 13th Doctor?",
        answer: ["jodie whittaker", "andrew"],
    },
];

const timeTable = [
    "01:35",
    "01:55",
    "02:15",
    "02:35",
    "02:55",
    "03:15",
    "03:35",
    "03:55",
    "04:15",
    "04:35",
    "04:55",
    "05:10",
    "05:15",
    "05:23",
    "05:30",
    "05:35",
    "05:45",
    "05:47",
    "05:55",
    "05:57",
    "05:59",
    "06:06",
    "06:09",
    "06:15",
    "06:16",
    "06:20",
    "06:26",
    "06:30",
    "06:35",
    "06:36",
    "06:40",
    "06:44",
    "06:50",
    "06:52",
    "06:54",
    "06:59",
    "07:00",
    "07:07",
    "07:09",
    "07:10",
    "07:15",
    "07:20",
    "07:21",
    "07:24",
    "07:28",
    "07:30",
    "07:34",
    "07:39",
    "07:40",
    "07:46",
    "07:50",
    "07:51",
    "07:52",
    "07:58",
    "08:00",
    "08:03",
    "08:04",
    "08:10",
    "08:15",
    "08:16",
    "08:20",
    "08:22",
    "08:27",
    "08:28",
    "08:30",
    "08:37",
    "08:39",
    "08:40",
    "08:45",
    "08:50",
    "08:53",
    "09:00",
    "09:02",
    "09:10",
    "09:18",
    "09:20",
    "09:27",
    "09:30",
    "09:37",
    "09:40",
    "09:49",
    "09:50",
    "09:59",
    "10:00",
    "10:09",
    "10:10",
    "10:19",
    "10:20",
    "10:29",
    "10:30",
    "10:39",
    "10:40",
    "10:49",
    "10:50",
    "10:59",
    "11:00",
    "11:09",
    "11:10",
    "11:19",
    "11:20",
    "11:29",
    "11:30",
    "11:39",
    "11:40",
    "11:49",
    "11:50",
    "11:59",
    "12:00",
    "12:09",
    "12:10",
    "12:19",
    "12:20",
    "12:29",
    "12:30",
    "12:39",
    "12:40",
    "12:49",
    "12:50",
    "12:59",
    "13:00",
    "13:09",
    "13:10",
    "13:19",
    "13:20",
    "13:29",
    "13:30",
    "13:39",
    "13:40",
    "13:49",
    "13:50",
    "13:59",
    "14:00",
    "14:09",
    "14:10",
    "14:19",
    "14:20",
    "14:29",
    "14:30",
    "14:39",
    "14:40",
    "14:49",
    "14:50",
    "14:59",
    "15:00",
    "15:09",
    "15:10",
    "15:15",
    "15:20",
    "15:24",
    "15:30",
    "15:34",
    "15:40",
    "15:44",
    "15:50",
    "15:55",
    "16:00",
    "16:04",
    "16:10",
    "16:11",
    "16:20",
    "16:21",
    "16:30",
    "16:40",
    "16:42",
    "16:50",
    "17:00",
    "17:03",
    "17:09",
    "17:10",
    "17:16",
    "17:20",
    "17:24",
    "17:30",
    "17:36",
    "17:40",
    "17:46",
    "17:50",
    "17:56",
    "18:00",
    "18:05",
    "18:10",
    "18:15",
    "18:20",
    "18:25",
    "18:30",
    "18:35",
    "18:40",
    "18:45",
    "18:50",
    "18:56",
    "19:00",
    "19:06",
    "19:10",
    "19:16",
    "19:20",
    "19:26",
    "19:30",
    "19:36",
    "19:40",
    "19:46",
    "19:50",
    "19:56",
    "20:00",
    "20:06",
    "20:10",
    "20:16",
    "20:20",
    "20:21",
    "20:26",
    "20:30",
    "20:31",
    "20:36",
    "20:40",
    "20:41",
    "20:46",
    "20:50",
    "20:51",
    "20:56",
    "21:00",
    "21:01",
    "21:08",
    "21:10",
    "21:13",
    "21:20",
    "21:25",
    "21:30",
    "21:32",
    "21:37",
    "21:40",
    "21:44",
    "21:49",
    "21:51",
    "21:54",
    "21:59",
    "22:01",
    "22:04",
    "22:13",
    "22:14",
    "22:24",
    "22:25",
    "22:34",
    "22:37",
    "22:38",
    "22:40",
    "22:49",
    "22:52",
    "23:02",
    "23:04",
    "23:07",
    "23:14",
    "23:16",
    "23:22",
    "23:26",
    "23:28",
    "23:38",
    "23:39",
    "23:41",
    "23:55",
    "24:15",
    "24:35",
    "24:55",
    "25:15",
];

const checkNum = (time) => {
    let indxr = timeTable.indexOf(time);
    if (indxr >= 0) {
        return indxr;
    } else {
        let timeArr = time.split("");
        if (timeArr[4] === "9") {
            // move up 1
            if (timeArr[3] === "5") {
                // move up by 10
                if (timeArr[0] === "2" && timeArr[1] === "3") {
                    //move up by a day
                    time = "00:00";
                } else {
                    timeArr[1] = parseInt(timeArr[1], 10) + 1;
                    timeArr[3] = 0;
                    timeArr[4] = 0;
                    time = timeArr.join("");
                }
            } else {
                timeArr[3] = parseInt(timeArr[3], 10) + 1;
                timeArr[4] = 0;
                time = timeArr.join("");
            }
        } else {
            timeArr[4] = parseInt(timeArr[4], 10) + 1;
            time = timeArr.join("");
        }
        return checkNum(time);
    }
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
        });
        let str = nyConvert.split(", ")[1].slice(0, -6);
        str = str.split("")[1] === ":" ? `0${str}` : str;

        const indx = checkNum(str);

        const time1 = timeTable[indx];
        // const time2 = time1 + 1;
        // const time3 = time1 + 2;

        return handlerInput.responseBuilder.speak(time1).getResponse();
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
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
