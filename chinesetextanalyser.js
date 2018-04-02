// Copyright Manu Cornet 2010. All rights reserved.

var thresholds;

var ChineseTextAnalyzer = function() {
};

ChineseTextAnalyzer.thresholdsToColors = {
  '0.0': '#ABFFA5',
  '0.1': '#7FF8FF'};

ChineseTextAnalyzer.lineBreakCharacters = [
  '。',
  '，',
  '；',
  '：'];

ChineseTextAnalyzer.prototype.getThresholds = function() {
  $.get("thresholds.data", null, ChineseTextAnalyzer.onDataReceived);
};

ChineseTextAnalyzer.onDataReceived = function(data) {

  // Get all lines. Each threshold is a line, and the number of characters is
  // separated from the string of characters by a colon.
  var lines = data.split('\n');

  thresholds = {};
  for (var i = 0; i < lines.length; i++) {
    var map = lines[i].split(':');
    thresholds[map[0]] = map[1];
  }

  // Hide/show elements for the results page.
  $("#input").hide();
  $("#explanation").hide();

  ChineseTextAnalyzer.analyzeTextWithThresholds();
};

ChineseTextAnalyzer.prototype.initCheckboxes = function() {
  var colorsControl = '';
  for (var threshNum in ChineseTextAnalyzer.thresholdsToColors) {
    colorsControl += '<input type="checkbox" checked="checked" name="' +
        threshNum + '"><span style="background-color: ' +
        ChineseTextAnalyzer.thresholdsToColors[threshNum] + '">' + threshNum +
        '</span></input>';
  }
  $("#colors").empty();
  $("#colors").append($(colorsControl));
  $("#colors").find("input").click(
      ChineseTextAnalyzer.analyzeTextWithThresholds);
}

ChineseTextAnalyzer.analyzeTextWithThresholds = function() {
  var text = $("#input")[0].value;

  var result = $("#result");
  result.empty();
  result.show();
  $("#analyzeButton").hide();
  $("#anotherText").show();


  $("#colors").show();
  var activeThresholds = [];

  $("#colors").find("input:checked").each(function () {
    var name = $(this).attr("name");
    activeThresholds.push(name);
  });

  var formattedText = '';

  for (var i = 0; i < text.length; i++) {
    formattedText += ChineseTextAnalyzer.formatOneCharacter(text[i],
        activeThresholds);
  }

  var formattedResult = $('<div id="formatted">' + formattedText + '</div>');
  result.append(formattedResult);
};


ChineseTextAnalyzer.formatOneCharacter = function(character, activeThresholds) {
  if (character == '\n') {
    return '<br/>';
  }
  if ($.inArray(character, ChineseTextAnalyzer.lineBreakCharacters) != -1) {
    return character + ' ';
  }

  for (var i = 0; i < activeThresholds[i]; i++) {
    var threshNum = activeThresholds[i];
    if (!thresholds[threshNum]) {
      // For some reason the object contains an "undefined: undefined" pair.
      continue;
    }
    if (thresholds[threshNum].indexOf(character) != -1) {
      // If this character belongs to a given threshold, apply the proper color.
      return '<span style="background-color: ' +
          ChineseTextAnalyzer.thresholdsToColors[threshNum] +
          '">' + character + '</span>'
    }
  }
  return '<span>' + character + '</span>';
};
