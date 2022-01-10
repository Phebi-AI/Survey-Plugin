function phebi_load() {
    var host = "eu2.phebi.ai";

    if (document.body == null) {
        window.setTimeout(phebi_load, 100);
        return;
    }

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
    catch (e) {
        // Wait 100 milliseconds for the script to load.
        window.setTimeout(phebi_load, 100);
        return;
    }

    PhebiSurvey.Survey = document.title;
    PhebiSurvey.Respondent = $("input[type='hidden'][name='respondent']")[0].value;

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

    // The delegate that is called when AutoNext=true and
    // the respondent finished answering all questions.
    PhebiSurvey.Submit = function () {
        // Find the next button on the page and click it.
        window.setTimeout(function () {
            $(".Button_Next")[0].click();
        }, 100);
    };

    try {
        PhebiSurvey.Init();
    }
    catch (e) {
        console.error(e);
    }
}
phebi_load();