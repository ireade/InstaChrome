"use strict";

$(document).ready(function() {

	function apiRequest() {

		var cleanTag;

		if ( tag.indexOf("#") === -1 ) {
			cleanTag = tag;
		} else {
			cleanTag = tag.split('#')[1];
		}

		cleanTag = cleanTag.replace(/\s/g, "");
		
		var requestUrl = 'https://api.instagram.com/v1/tags/'+cleanTag+'/media/recent?access_token='+accessToken+'&callback=?';

		$.getJSON(requestUrl, {}, function(data) {

			var items = [];

			for (var i=0; i < 6; i++) {
				items.push(data.data[i]);
			}

			var source = $('#grams-template').html();
			var template = Handlebars.compile(source);
			var output = template( {Grams: items} );

			
			if (data.data.length === 0) {
				$('.loading').hide();
				$("#grams").html('<p class="error">Sorry, nothing turned up! Please try again</p>')
				
			} else {
				$('.loading').hide();
				$("#grams").html(output).fadeIn();
			}
		});
	}

	$('#search').on('submit', function() {

		$("#grams").html("");
		$('.loading').show();

		var searchInput = $('#searchText').val();
		tag = searchInput;
		apiRequest();

		return false;
	})

	// Set Default
	var tag = '#yolo';
	apiRequest();


	$('input[type="text"]').val(tag);

});