"use strict";

$(document).ready(function() {

	var request = function() {

		chrome.storage.local.get("tag", function(result) {

			var tag = result.tag;
			var cleanTag;

			// Display # on the front end, but remove # for the cleanTag variable
			if ( tag.indexOf("#") === -1 ) {
				cleanTag = tag;
				$('input[type="text"]').val('#'+tag);
			} else {
				cleanTag = tag.split('#')[1];
			}


			cleanTag = cleanTag.replace(/\s/g, "");

			
			var requestUrl = 'https://api.instagram.com/v1/tags/'+cleanTag+'/media/recent?access_token='+accessToken+'&callback=?';

			$.getJSON(requestUrl, {}, function(data) {

				var items = [];

				// Get only 6 items
				for (var i=0; i < 6; i++) {
					items.push(data.data[i]);
				}

				// Setup Handlebars templating
				var source = $('#grams-template').html();
				var template = Handlebars.compile(source);
				var output = template( {Grams: items} );


				$('.loading').hide();

				if (data.data.length === 0) {
					// Show error messages if no images for this tag
					$('.message-error').show();
				} else {
					// Else, display the images in the template
					$("#grams").html(output).fadeIn();
				}
			});


		}); // end get local storage

	}; // end request

	
	// When users search
	$('#search').on('submit', function() {

		// Clear messages and any previous images, and show loading animation
		$('.message').hide();
		$("#grams").html("");
		$('.loading').show();

		var searchInput = $('#searchText').val();

		// Set the search text to local storage
		chrome.storage.local.set({"tag" : searchInput}, function(){
			request();
		});

		return false;
	})



	// On load of the new tab, check if there is any tag previously stored
	chrome.storage.local.get("tag", function(result) {

		if ( result.tag ) {

			request();
			$('input[type="text"]').val(result.tag);

		} else {

			$('.loading').hide();
			$('.message-welcome').show();
			
		}

	})


});