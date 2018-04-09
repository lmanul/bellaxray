// Copyright Manu Cornet 2010. All rights reserved.

var thresholds;

var ChineseTextAnalyzer = function() {
};

ChineseTextAnalyzer.thresholdsToColors = {
  '0.0': '#6da5ff',
  '0.5': '#6df0ff',
  '0.6': '#6dffda',
  '1.1': '#30e886',
  '1.2': '#30e839',
  '1.2.5': '#8ce830',
  '1.3': '#cfe830',
  '1.4': '#fffb1c',
  '1.5': '#ffcd1c',
  '1.6': '#ff951c',
  'TI1': '#c259ff',
};

ChineseTextAnalyzer.lineBreakCharacters = [
  '。',
  '，',
  '；',
  '：'];

ChineseTextAnalyzer.prototype.getThresholds = function() {
  $.get("thresholds.data", null, ChineseTextAnalyzer.onDataReceived);
};

ChineseTextAnalyzer.prototype.onBodyLoaded = function() {
  $('#input').on('input propertychange', this, function(e) {
    self = e.data;
    self.analyzeTextWithThresholds();
  });
}

ChineseTextAnalyzer.onDataReceived = function(data) {

  // Get all lines. Each threshold is a line, and the number of characters is
  // separated from the string of characters by a colon.
  var lines = data.split('\n');

  thresholds = {};
  for (var i = 0; i < lines.length; i++) {
    var map = lines[i].split(':');
    thresholds[map[0]] = map[1];
  }
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

ChineseTextAnalyzer.prototype.analyzeTextWithThresholds = function() {
  var text = $("#input")[0].value;

  var result = $("#result");
  result.empty();

  var activeThresholds = [];

  $("#colors").find("input:checked").each(function () {
    var name = $(this).attr("name");
    activeThresholds.push(name);
  });

  var formattedText = '';

  for (var i = 0; i < text.length; i++) {
    formattedText += this.formatOneCharacter(text[i], activeThresholds);
  }

  var formattedResult = $('<div id="formatted">' + formattedText + '</div>');
  result.append(formattedResult);
};


ChineseTextAnalyzer.prototype.formatOneCharacter = function(character, activeThresholds) {
  if (character == '\n') {
    return '<br/>';
  }
  if ($.inArray(character, ChineseTextAnalyzer.lineBreakCharacters) != -1) {
    return character + ' ';
  }

  for (var i = 0; i < activeThresholds.length; i++) {
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
