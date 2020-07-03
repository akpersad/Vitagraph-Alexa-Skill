const https = require("https");
const { stories, timeTable } = require("./objects");
const keyAPI = process.env.G_API_KEY;
const mapURL = new URL("https://maps.googleapis.com/maps/api/directions/json?");

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

const getHttp = (slot) => {
    let destinationVal;
    let modeVal = "driving";

    switch (slot.toLowerCase()) {
        case "parents":
            destinationVal = "430+East+4th+Street+Brooklyn+NY+11218";
            break;

        case "bronx":
            destinationVal = "2318+Cambreleng+Ave+Bronx+NY+10458";
            break;

        case "posse":
            destinationVal = "14+Wall+Street+New+York+NY+10005";
            modeVal = "subway";
            break;

        case "deloitte":
            destinationVal = "330+Hudson+Street+New+York+NY+10013";
            modeVal = "subway";

        default:
            destinationVal = "60+Washington+Square+S+New+York+NY+10012";
            break;
    }

    const params = {
        key: keyAPI,
        origin: "1277+East+14th+Street+Brooklyn+NY+11230",
        destination: destinationVal,
        mode: modeVal,
        departure_time: "now",
    };

    for (let i = 0; Object.keys(params).length > i; i++) {
        mapURL.searchParams.set(
            Object.keys(params)[i],
            params[Object.keys(params)[i]]
        );
    }

    return new Promise((resolve, reject) => {
        const request = https.get(mapURL.href, (response) => {
            response.setEncoding("utf8");

            let returnData = "";
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(
                    new Error(
                        `${response.statusCode}: ${response.req.getHeader(
                            "host"
                        )} ${response.req.path}`
                    )
                );
            }

            response.on("data", (chunk) => {
                returnData += chunk;
            });

            response.on("end", () => {
                resolve(returnData);
            });

            response.on("error", (error) => {
                reject(error);
            });
        });
        request.end();
    });
};

module.exports = {
    determineLeapYear,
    getNextStory,
    checkAnswer,
    checkNum,
    getHttp,
};
