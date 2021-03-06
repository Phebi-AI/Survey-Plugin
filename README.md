# Survey-Plugin

The Phebi Plugin Framework can be used to voice enable a survey or survey platform. It manages creation of custom language models for closed questions, microphone access, transcription and filling in the survey.

## 1. Framework javascript

To load the plugin framework, load the Survey3.css and Survey3.js from your Phebi Portal host.

```
function phebi_load() {
    var host = "eu2.phebi.ai";

    // Check if a host is defined in the settings,
    // to load the scripts from that specific host.
    if (window.PhebiSettings != null && PhebiSettings.Host != null)
        host = PhebiSettings.Host;

    // Check if the Phebi Plugin Framework has been loaded.
    if (document.getElementById("phebi_survey") == null) {
        // Load the Phebi Plugin Stylesheet.
        var input = document.createElement("link");
        input.rel = "stylesheet";
        input.href = "https://" + host + "/Survey3.css";
        document.body.appendChild(input);

        // Load the Phebi Plugin Framework.
        input = document.createElement("script");
        input.id = "phebi_survey";
        input.type = "text/javascript";
        input.src = "https://" + host + "/Survey3.js";
        document.body.appendChild(input);
    }
    // Check if the Phebi Plugin Framework has loaded yet.
    try {
        if (PhebiSurvey == null) {
            window.setTimeout(phebi_load, 100);
            return;
        }
    }
    catch(e) {
        // Wait 100 milliseconds for the script to load.
        window.setTimeout(phebi_load, 100);
        return;
    }
}
phebi_load();
```

## 2. Basics

In order for the values to appear correctly in the Phebi Portal, the Plugin needs to know the name of the survey and the unique respondent id.

```
PhebiSurvey.Survey = document.title;
PhebiSurvey.Respondent = $("input[type='hidden'][name='respondent']")[0].value;
```

## 3. Parsing questions and categories from the page.

In order for Phebi to work on your survey, we need to pass information about the questions on the page to the Plugin and the Phebi Server.

```
PhebiSurvey.OnLoad = function () {
    PhebiSurvey.Questions = [];
    var questions = $(".Question");

    var question, categories, category, label;

    for (var i = 0; i < questions.length; i++) {
        label = $(questions[i]).find(".Question_Text")[0];

        question = {
            Name: questions[i].id, // The unique name of the question (Q1, Q2 etc)
            Label: label.innerText.trim(), // The question text used for the readout, if enabled.
            Container: label, // The question text control where the plugin will appear.
            Type: questions[i].className.split('Question_')[1].split(" ")[0].toLowerCase(), // The type of the question (open, single, multi, grid).
            Categories: []
        };

        if (question.Type == "open") {
            question.Control = $(questions[i]).find("textarea")[0];
        }
        else if (question.Type == "grid") {
            question.Rows = [];
            var rows = $(questions[i]).find(".Row");

            for (var r = 0; r < rows.length; r++) {
                question.Rows.push({
                    Label: rows[r].innerText.trim(),
                    Controls: $(rows[r].parentNode).find("input")
                });
            }

            categories = $(questions[i]).find(".Category");

            for (var c = 0; c < categories.length; c++) {
                question.Categories.push({
                    Name: categories[c].id,
                    Control: categories[c],
                    Index: c,
                    Label: categories[c].innerText.trim()
                });
            }
        }
        else {
            categories = $(questions[i]).find(".Category input");

            for (var c = 0; c < categories.length; c++) {
                category = {
                    Name: categories[c].id, // The unique name of the category (c1, c2 etc).
                    Label: categories[c].parentNode.innerText.trim(), // The text of the category used to build the custom language model for the question.
                    Control: categories[c] // The category control that is clicked when answered via voice.
                };

                // Add the category definition to the question's categories.
                question.Categories.push(category);
            }
        }

        // Add the question definition to the page's questions.
        PhebiSurvey.Questions.push(question);
    }
};
```

## 4. Auto Next

By default auto next is enabled. It will click the next button after a successful voice answer was given. For that the plugin needs to know how to click the next button.


```
// The delegate that is called when AutoNext=true and
// the respondent finished answering all questions.
PhebiSurvey.Submit = function() {
    // Find the next button on the page and click it.
    window.setTimeout(function () {
        $(".Button_Next")[0].click();
    }, 100);
};
```

## 5. Initialize the plugin

Once we have defined how to parse the question of the screen we can initialize the plugin. It will load the defined settings, register the custom language models with the defined host and create the plugin control and add it to the first question's defined container. 

```   
try {
    PhebiSurvey.Init();
}
catch (e) {
    console.error(e);
}
```

## 6. Test the survey.

You can now test the voice enabled survey. A live example of this plugin is available online at:
https://global.phebi.ai/Survey-Plugin/index.html
