"use strict";

$(document).ready(function() {

	var request = function() {

		chrome.storage.local.get("tag", function(result) {

			var tag = result.tag;
			var cleanTag;

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

				for (var i=0; i < 6; i++) {
					items.push(data.data[i]);
				}

				var source = $('#grams-template').html();
				var template = Handlebars.compile(source);
				var output = template( {Grams: items} );

				
				if (data.data.length === 0) {
					$('.loading').hide();
					$("#grams").html('<p class="message">Sorry, nothing turned up! Please try again</p>')
					
				} else {
					$('.loading').hide();
					$("#grams").html(output).fadeIn();
				}
			});


		}); // end get local storage

	}; // end apiRequest

	$('#search').on('submit', function() {

		$("#grams").html("");
		$('.loading').show();

		var searchInput = $('#searchText').val();


		chrome.storage.local.set({"tag" : searchInput}, function(){

			request();

		});

		return false;
	})



	chrome.storage.local.get("sertag", function(result) {

		if ( result.tag ) {

			request();
			$('input[type="text"]').val(result.tag);

		} else {

			$('.loading').hide();
			$("#grams").html('<p class="message">Welcome to InstaChrome!</p>')
			
		}

	})


});