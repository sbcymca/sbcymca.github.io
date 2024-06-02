"use strict";
(function () {
	// Global variables
	var
		userAgent = navigator.userAgent.toLowerCase(),
		initialDate = new Date(),

		$document = $(document),
		$window = $(window),
		$html = $("html"),
		$body = $("body"),

		isDesktop = $html.hasClass("desktop"),
		isIE = userAgent.indexOf("msie") !== -1 ? parseInt(userAgent.split("msie")[1], 10) : userAgent.indexOf("trident") !== -1 ? 11 : userAgent.indexOf("edge") !== -1 ? 12 : false,
		isSafari = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1,
		isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
		isTouch = "ontouchstart" in window,
		detailsBlock = document.getElementsByClassName('block-with-details'),
		windowReady = false,
		isNoviBuilder = false,
		livedemo = false,

		plugins = {
			buttonNina:                 $('.button-nina'),
			checkbox:                   $('input[type="checkbox"]'),
			customToggle:               $('[data-custom-toggle]'),
			lightGallery:               $('[data-lightgallery="group"]'),
			lightGalleryItem:           $('[data-lightgallery="item"]'),
			lightDynamicGalleryItem:    $('[data-lightgallery="dynamic"]'),
			jPlayer:                    $('.jp-jplayer'),
			jPlayerInit:                $('.jp-player-init'),
			jPlayerVideo:               $('.jp-video-init'),
			materialParallax:           $('.parallax-container'),
			owl:                        $('.owl-carousel'),
			preloader:                  $('.page-loader'),
			radio:                      $('input[type="radio"]'),
			swiper:                     $('.swiper-container'),
			rdNavbar:                   $('.rd-navbar'),
			copyrightYear:              $('.copyright-year'),
			rdMailForm:                 $('.rd-mailform'),
			rdInputLabel:               $('.form-label'),
			search:                     $('.rd-search'),
			searchResults:              $('.rd-search-results'),
			regula:                     $('[data-constraints]'),
			captcha:                    $('.recaptcha'),
			wow:                        $('.wow'),
			maps:                       $('.google-map-container'),
			counter:                    document.querySelectorAll('.counter'),
			progressCircle:             document.querySelectorAll('.progress-circle'),
		};


	/**
	 * @desc Check the element was been scrolled into the view
	 * @param {object} elem - jQuery object
	 * @return {boolean}
	 */
	function isScrolledIntoView(elem) {
		if (isNoviBuilder) return true;
		return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
	}


	/**
	 * @desc Calls a function when element has been scrolled into the view
	 * @param {object} element - jQuery object
	 * @param {function} func - init function
	 */
	function lazyInit(element, func) {
		var scrollHandler = function () {
			if ((!element.hasClass('lazy-loaded') && (isScrolledIntoView(element)))) {
				func.call(element);
				element.addClass('lazy-loaded');
			}
		};

		scrollHandler();
		$window.on('scroll', scrollHandler);
	}


	// Initialize scripts that require a loaded window
	$window.on('load', function () {
		// Page loader & Page transition
		if (plugins.preloader.length && !isNoviBuilder) {
			pageTransition({
				target:            document.querySelector('.page'),
				delay:             0,
				duration:          500,
				classIn:           'fadeIn',
				classOut:          'fadeOut',
				classActive:       'animated',
				conditions:        function (event, link) {
					return link
						&& !/(\#|javascript:void\(0\)|callto:|tel:|mailto:|:\/\/)/.test(link)
						&& !event.currentTarget.hasAttribute('data-lightgallery');
				},
				onTransitionStart: function (options) {
					setTimeout(function () {
						plugins.preloader.removeClass('loaded');
					}, options.duration * .75);
				},
				onReady:           function () {
					plugins.preloader.addClass('loaded');
					windowReady = true;
				}
			});
		}
		
		// Material Parallax
		if (plugins.materialParallax.length) {
			if (!isNoviBuilder && !isIE && !isMobile) {
				plugins.materialParallax.parallax();
			} else {
				for (let i = 0; i < plugins.materialParallax.length; i++) {
					let $parallax = $(plugins.materialParallax[i]);
					
					$parallax.addClass('parallax-disabled');
					$parallax.css({"background-image": 'url(' + $parallax.data("parallax-img") + ')'});
				}
			}
		}
	});


	// Initialize scripts that require a finished document
	$(function () {
		isNoviBuilder = window.xMode;

		/**
		 * Wrapper to eliminate json errors
		 * @param {string} str - JSON string
		 * @returns {object} - parsed or empty object
		 */
		function parseJSON ( str ) {
			try {
				if ( str )  return JSON.parse( str );
				else return {};
			} catch ( error ) {
				return {};
			}
		}
		
		/**
		 * @desc Sets the actual previous index based on the position of the slide in the markup. Should be the most recent action.
		 * @param {object} swiper - swiper instance
		 */
		function setRealPrevious(swiper) {
			let element = swiper.$wrapperEl[0].children[swiper.activeIndex];
			swiper.realPrevious = Array.prototype.indexOf.call(element.parentNode.children, element);
		}
		
		/**
		 * @desc Sets slides background images from attribute 'data-slide-bg'
		 * @param {object} swiper - swiper instance
		 */
		function setBackgrounds(swiper) {
			let swipersBg = swiper.el.querySelectorAll('[data-slide-bg]');
			
			for (let i = 0; i < swipersBg.length; i++) {
				let swiperBg = swipersBg[i];
				swiperBg.style.backgroundImage = 'url(' + swiperBg.getAttribute('data-slide-bg') + ')';
			}
		}
		
		/**
		 * @desc Animate captions on active slides
		 * @param {object} swiper - swiper instance
		 */
		function initCaptionAnimate(swiper) {
			let
				animate = function (caption) {
					return function () {
						let duration;
						if (duration = caption.getAttribute('data-caption-duration')) caption.style.animationDuration = duration + 'ms';
						caption.classList.remove('not-animated');
						caption.classList.add(caption.getAttribute('data-caption-animate'));
						caption.classList.add('animated');
					};
				},
				initializeAnimation = function (captions) {
					for (let i = 0; i < captions.length; i++) {
						let caption = captions[i];
						caption.classList.remove('animated');
						caption.classList.remove(caption.getAttribute('data-caption-animate'));
						caption.classList.add('not-animated');
					}
				},
				finalizeAnimation = function (captions) {
					for (let i = 0; i < captions.length; i++) {
						let caption = captions[i];
						if (caption.getAttribute('data-caption-delay')) {
							setTimeout(animate(caption), Number(caption.getAttribute('data-caption-delay')));
						} else {
							animate(caption)();
						}
					}
				};
			
			// Caption parameters
			swiper.params.caption = {
				animationEvent: 'slideChangeTransitionEnd'
			};
			
			initializeAnimation(swiper.$wrapperEl[0].querySelectorAll('[data-caption-animate]'));
			finalizeAnimation(swiper.$wrapperEl[0].children[swiper.activeIndex].querySelectorAll('[data-caption-animate]'));
			
			if (swiper.params.caption.animationEvent === 'slideChangeTransitionEnd') {
				swiper.on(swiper.params.caption.animationEvent, function () {
					initializeAnimation(swiper.$wrapperEl[0].children[swiper.previousIndex].querySelectorAll('[data-caption-animate]'));
					finalizeAnimation(swiper.$wrapperEl[0].children[swiper.activeIndex].querySelectorAll('[data-caption-animate]'));
				});
			} else {
				swiper.on('slideChangeTransitionEnd', function () {
					initializeAnimation(swiper.$wrapperEl[0].children[swiper.previousIndex].querySelectorAll('[data-caption-animate]'));
				});
				
				swiper.on(swiper.params.caption.animationEvent, function () {
					finalizeAnimation(swiper.$wrapperEl[0].children[swiper.activeIndex].querySelectorAll('[data-caption-animate]'));
				});
			}
		}

		/**
		 * @desc Google map function for getting latitude and longitude
		 */
		function getLatLngObject(str, marker, map, callback) {
			let coordinates = {};
			try {
				coordinates = JSON.parse(str);
				callback(new google.maps.LatLng(
					coordinates.lat,
					coordinates.lng
				), marker, map)
			} catch (e) {
				map.geocoder.geocode({'address': str}, function (results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						let latitude = results[0].geometry.location.lat();
						let longitude = results[0].geometry.location.lng();

						callback(new google.maps.LatLng(
							parseFloat(latitude),
							parseFloat(longitude)
						), marker, map)
					}
				})
			}
		}

		/**
		 * @desc Initialize Google maps
		 */
		function initMaps() {
			let key;

			for (let i = 0; i < plugins.maps.length; i++) {
				if (plugins.maps[i].hasAttribute("data-key")) {
					key = plugins.maps[i].getAttribute("data-key");
					break;
				}
			}

			$.getScript('//maps.google.com/maps/api/js?' + (key ? 'key=' + key + '&' : '') + 'libraries=geometry,places&v=quarterly', function () {
				let head = document.getElementsByTagName('head')[0],
					insertBefore = head.insertBefore;

				head.insertBefore = function (newElement, referenceElement) {
					if (newElement.href && newElement.href.indexOf('//fonts.googleapis.com/css?family=Roboto') !== -1 || newElement.innerHTML.indexOf('gm-style') !== -1) {
						return;
					}
					insertBefore.call(head, newElement, referenceElement);
				};
				let geocoder = new google.maps.Geocoder;
				for (let i = 0; i < plugins.maps.length; i++) {
					let zoom = parseInt(plugins.maps[i].getAttribute("data-zoom"), 10) || 11;
					let styles = plugins.maps[i].hasAttribute('data-styles') ? JSON.parse(plugins.maps[i].getAttribute("data-styles")) : [];
					let center = plugins.maps[i].getAttribute("data-center") || "New York";

					// Initialize map
					let map = new google.maps.Map(plugins.maps[i].querySelectorAll(".google-map")[0], {
						zoom:        zoom,
						styles:      styles,
						scrollwheel: false,
						center:      {
							lat: 0,
							lng: 0
						}
					});

					// Add map object to map node
					plugins.maps[i].map = map;
					plugins.maps[i].geocoder = geocoder;
					plugins.maps[i].keySupported = true;
					plugins.maps[i].google = google;

					// Get Center coordinates from attribute
					getLatLngObject(center, null, plugins.maps[i], function (location, markerElement, mapElement) {
						mapElement.map.setCenter(location);
					});

					// Add markers from google-map-markers array
					let markerItems = plugins.maps[i].querySelectorAll(".google-map-markers li");

					if (markerItems.length) {
						let markers = [];
						for (let j = 0; j < markerItems.length; j++) {
							let markerElement = markerItems[j];
							getLatLngObject(markerElement.getAttribute("data-location"), markerElement, plugins.maps[i], function (location, markerElement, mapElement) {
								let icon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon");
								let activeIcon = markerElement.getAttribute("data-icon-active") || mapElement.getAttribute("data-icon-active");
								let info = markerElement.getAttribute("data-description") || "";
								let infoWindow = new google.maps.InfoWindow({
									content: info
								});
								markerElement.infoWindow = infoWindow;
								let markerData = {
									position: location,
									map:      mapElement.map
								}
								if (icon) {
									markerData.icon = icon;
								}
								let marker = new google.maps.Marker(markerData);
								markerElement.gmarker = marker;
								markers.push({
									markerElement: markerElement,
									infoWindow:    infoWindow
								});
								marker.isActive = false;
								// Handle infoWindow close click
								google.maps.event.addListener(infoWindow, 'closeclick', (function (markerElement, mapElement) {
									let markerIcon = null;
									markerElement.gmarker.isActive = false;
									markerIcon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon");
									markerElement.gmarker.setIcon(markerIcon);
								}).bind(this, markerElement, mapElement));


								// Set marker active on Click and open infoWindow
								google.maps.event.addListener(marker, 'click', (function (markerElement, mapElement) {
									let markerIcon;
									if (markerElement.infoWindow.getContent().length === 0) return;
									let gMarker, currentMarker = markerElement.gmarker, currentInfoWindow;
									for (let k = 0; k < markers.length; k++) {
										if (markers[k].markerElement === markerElement) {
											currentInfoWindow = markers[k].infoWindow;
										}
										gMarker = markers[k].markerElement.gmarker;
										if (gMarker.isActive && markers[k].markerElement !== markerElement) {
											gMarker.isActive = false;
											markerIcon = markers[k].markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon")
											gMarker.setIcon(markerIcon);
											markers[k].infoWindow.close();
										}
									}

									currentMarker.isActive = !currentMarker.isActive;
									if (currentMarker.isActive) {
										if (markerIcon = markerElement.getAttribute("data-icon-active") || mapElement.getAttribute("data-icon-active")) {
											currentMarker.setIcon(markerIcon);
										}

										currentInfoWindow.open(map, marker);
									} else {
										if (markerIcon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon")) {
											currentMarker.setIcon(markerIcon);
										}
										currentInfoWindow.close();
									}
								}).bind(this, markerElement, mapElement))
							})
						}
					}
				}
			});
		}
		
		/**
		 * Live Search
		 * @description  create live search results
		 */
		function liveSearch(options) {
			options.live.removeClass('cleared').html();
			options.current++;
			options.spin.addClass('loading');
			
			$.get(handler, {
				s:          decodeURI(options.term),
				liveSearch: options.element.attr('data-search-live'),
				dataType:   "html",
				liveCount:  options.liveCount,
				filter:     options.filter,
				template:   options.template
			}, function (data) {
				options.processed++;
				var live = options.live;
				if (options.processed == options.current && !live.hasClass('cleared')) {
					live.find('> #search-results').removeClass('active');
					live.html(data);
					setTimeout(function () {
						live.find('> #search-results').addClass('active');
					}, 50);
				}
				options.spin.parents('.rd-search').find('.input-group-addon').removeClass('loading');
			})
		}

		/**
		 * @desc Attach form validation to elements
		 * @param {object} elements - jQuery object
		 */
		function attachFormValidator(elements) {
			// Custom validator - phone number
			regula.custom({
				name:           'PhoneNumber',
				defaultMessage: 'Invalid phone number format',
				validator:      function () {
					if (this.value === '') return true;
					else return /^(\+\d)?[0-9\-\(\) ]{5,}$/i.test(this.value);
				}
			});

			for (let i = 0; i < elements.length; i++) {
				let o = $(elements[i]), v;
				o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
				v = o.parent().find(".form-validation");
				if (v.is(":last-child")) o.addClass("form-control-last-child");
			}

			elements.on('input change propertychange blur', function (e) {
				let $this = $(this), results;

				if (e.type !== "blur") if (!$this.parent().hasClass("has-error")) return;
				if ($this.parents('.rd-mailform').hasClass('success')) return;

				if ((results = $this.regula('validate')).length) {
					for (let i = 0; i < results.length; i++) {
						$this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error");
					}
				} else {
					$this.siblings(".form-validation").text("").parent().removeClass("has-error")
				}
			}).regula('bind');

			let regularConstraintsMessages = [
				{
					type:       regula.Constraint.Required,
					newMessage: "The text field is required."
				},
				{
					type:       regula.Constraint.Email,
					newMessage: "The email is not a valid email."
				},
				{
					type:       regula.Constraint.Numeric,
					newMessage: "Only numbers are required"
				},
				{
					type:       regula.Constraint.Selected,
					newMessage: "Please choose an option."
				}
			];


			for (let i = 0; i < regularConstraintsMessages.length; i++) {
				let regularConstraint = regularConstraintsMessages[i];

				regula.override({
					constraintType: regularConstraint.type,
					defaultMessage: regularConstraint.newMessage
				});
			}
		}

		/**
		 * @desc Check if all elements pass validation
		 * @param {object} elements - object of items for validation
		 * @param {object} captcha - captcha object for validation
		 * @return {boolean}
		 */
		function isValidated(elements, captcha) {
			let results, errors = 0;

			if (elements.length) {
				for (let j = 0; j < elements.length; j++) {

					let $input = $(elements[j]);
					if ((results = $input.regula('validate')).length) {
						for (let k = 0; k < results.length; k++) {
							errors++;
							$input.siblings(".form-validation").text(results[k].message).parent().addClass("has-error");
						}
					} else {
						$input.siblings(".form-validation").text("").parent().removeClass("has-error")
					}
				}

				if (captcha) {
					if (captcha.length) {
						return validateReCaptcha(captcha) && errors === 0
					}
				}

				return errors === 0;
			}
			return true;
		}

		/**
		 * @desc Validate google reCaptcha
		 * @param {object} captcha - captcha object for validation
		 * @return {boolean}
		 */
		function validateReCaptcha(captcha) {
			let captchaToken = captcha.find('.g-recaptcha-response').val();

			if (captchaToken.length === 0) {
				captcha
					.siblings('.form-validation')
					.html('Please, prove that you are not robot.')
					.addClass('active');
				captcha
					.closest('.form-wrap')
					.addClass('has-error');

				captcha.on('propertychange', function () {
					let $this = $(this),
						captchaToken = $this.find('.g-recaptcha-response').val();

					if (captchaToken.length > 0) {
						$this
							.closest('.form-wrap')
							.removeClass('has-error');
						$this
							.siblings('.form-validation')
							.removeClass('active')
							.html('');
						$this.off('propertychange');
					}
				});

				return false;
			}

			return true;
		}

		/**
		 * @desc Initialize Google reCaptcha
		 */
		window.onloadCaptchaCallback = function () {
			for (let i = 0; i < plugins.captcha.length; i++) {
				let
					$captcha = $(plugins.captcha[i]),
					resizeHandler = (function () {
						let
							frame = this.querySelector('iframe'),
							inner = this.firstElementChild,
							inner2 = inner.firstElementChild,
							containerRect = null,
							frameRect = null,
							scale = null;

						inner2.style.transform = '';
						inner.style.height = 'auto';
						inner.style.width = 'auto';

						containerRect = this.getBoundingClientRect();
						frameRect = frame.getBoundingClientRect();
						scale = containerRect.width / frameRect.width;

						if (scale < 1) {
							inner2.style.transform = 'scale(' + scale + ')';
							inner.style.height = (frameRect.height * scale) + 'px';
							inner.style.width = (frameRect.width * scale) + 'px';
						}
					}).bind(plugins.captcha[i]);

				grecaptcha.render(
					$captcha.attr('id'),
					{
						sitekey:  $captcha.attr('data-sitekey'),
						size:     $captcha.attr('data-size') ? $captcha.attr('data-size') : 'normal',
						theme:    $captcha.attr('data-theme') ? $captcha.attr('data-theme') : 'light',
						callback: function () {
							$('.recaptcha').trigger('propertychange');
						}
					}
				);

				$captcha.after("<span class='form-validation'></span>");

				if (plugins.captcha[i].hasAttribute('data-auto-size')) {
					resizeHandler();
					window.addEventListener('resize', resizeHandler);
				}
			}
		};
		
		
		/**
		 * @desc Initialize the gallery with set of images
		 * @param {object} itemsToInit - jQuery object
		 * @param {string} [addClass] - additional gallery class
		 */
		function initLightGallery(itemsToInit, addClass) {
			if (!isNoviBuilder) {
				$(itemsToInit).lightGallery({
					thumbnail: $(itemsToInit).attr("data-lg-thumbnail") !== "false",
					selector:  "[data-lightgallery='item']",
					autoplay:  $(itemsToInit).attr("data-lg-autoplay") === "true",
					pause:     parseInt($(itemsToInit).attr("data-lg-autoplay-delay")) || 5000,
					addClass:  addClass,
					mode:      $(itemsToInit).attr("data-lg-animation") || "lg-slide",
					loop:      $(itemsToInit).attr("data-lg-loop") !== "false"
				});
			}
		}
		
		/**
		 * @desc Initialize the gallery with dynamic addition of images
		 * @param {object} itemsToInit - jQuery object
		 * @param {string} [addClass] - additional gallery class
		 */
		function initDynamicLightGallery(itemsToInit, addClass) {
			if (!isNoviBuilder) {
				$(itemsToInit).on("click", function () {
					$(itemsToInit).lightGallery({
						thumbnail: $(itemsToInit).attr("data-lg-thumbnail") !== "false",
						selector:  "[data-lightgallery='item']",
						autoplay:  $(itemsToInit).attr("data-lg-autoplay") === "true",
						pause:     parseInt($(itemsToInit).attr("data-lg-autoplay-delay")) || 5000,
						addClass:  addClass,
						mode:      $(itemsToInit).attr("data-lg-animation") || "lg-slide",
						loop:      $(itemsToInit).attr("data-lg-loop") !== "false",
						dynamic:   true,
						dynamicEl: JSON.parse($(itemsToInit).attr("data-lg-dynamic-elements")) || []
					});
				});
			}
		}
		
		/**
		 * @desc Initialize the gallery with one image
		 * @param {object} itemToInit - jQuery object
		 * @param {string} [addClass] - additional gallery class
		 */
		function initLightGalleryItem(itemToInit, addClass) {
			if (!isNoviBuilder) {
				$(itemToInit).lightGallery({
					selector:            "this",
					addClass:            addClass,
					counter:             false,
					youtubePlayerParams: {
						modestbranding: 1,
						showinfo:       0,
						rel:            0,
						controls:       0
					},
					vimeoPlayerParams:   {
						byline:   0,
						portrait: 0
					}
				});
			}
		}
		
		
		/**
		 * initNinaButtons
		 * @description  Make hover effect for nina buttons
		 */
		function initNinaButtons(ninaButtons) {
			for (var i = 0; i < ninaButtons.length; i++) {
				var btn = ninaButtons[i],
					origContent = btn.innerHTML.trim();

				if (!origContent) {
					continue;
				}

				var textNode = Array.prototype.slice.call(ninaButtons[i].childNodes).filter(function (node) {
					return node.nodeType === 3;
				}).pop();
				if (textNode == null) {
					continue;
				}

				var dummy = document.createElement('div');
				btn.replaceChild(dummy, textNode);
				dummy.outerHTML = textNode.textContent.split('').map(function (letter) {
					return "<span>" + letter.trim() + "</span>";
				}).join('');

				Array.prototype.slice.call(btn.childNodes).forEach(function (el, count) {
					el.style.transition = 'opacity .22s ' + 0.03 * count + 's,' + ' transform .22s ' + 0.03 * count + 's' + ', color .22s';
				});

				btn.innerHTML += "<span class='button-original-content'>" + origContent + "</span>";

				var delay = 0.03 * (btn.childElementCount - 1);
				// btn.getElementsByClassName('button-original-content')[0].style.transitionDelay = delay + 's';
				btn.getElementsByClassName('button-original-content')[0].style.transition = 'background .22s, color .22s, transform .22s ' + delay + 's';

				btn.addEventListener('mouseenter', function (e) {
					e.stopPropagation();
				});

				btn.addEventListener('mouseleave', function (e) {
					e.stopPropagation();
				});
			}
		}


		// Copyright Year (Evaluates correct copyright year)
		if (plugins.copyrightYear.length) {
			plugins.copyrightYear.text(initialDate.getFullYear());
		}

		/**
		 * Is Mac os
		 * @description  add additional class on html if mac os.
		 */
		if (navigator.platform.match(/(Mac)/i)) $html.addClass("mac-os");

		/**
		 * Is Safari
		 * @description  add additional class on html if safari.
		 */
		if (isSafari) $html.addClass("safari");

		// Adds some loosing functionality to IE browsers (IE Polyfills)
		if (isIE) {
			if (isIE === 12) $html.addClass("ie-edge");
			if (isIE === 11) $html.addClass("ie-11");
			if (isIE < 10) $html.addClass("lt-ie-10");
			if (isIE < 11) $html.addClass("ie-10");
		}

		// Add custom styling options for input[type="radio"]
		if (plugins.radio.length) {
			for (let i = 0; i < plugins.radio.length; i++) {
				$(plugins.radio[i]).addClass("radio-custom").after("<span class='radio-custom-dummy'></span>")
			}
		}

		// Add custom styling options for input[type="checkbox"]
		if (plugins.checkbox.length) {
			for (let i = 0; i < plugins.checkbox.length; i++) {
				$(plugins.checkbox[i]).addClass("checkbox-custom").after("<span class='checkbox-custom-dummy'></span>")
			}
		}

		// RD Navbar
		if (plugins.rdNavbar.length) {
			var
				navbar = plugins.rdNavbar,
				aliases = {
					'-':      0,
					'-sm-':   480,
					'-md-':   768,
					'-lg-':   992,
					'-xl-':   1200,
					'-xxl-':  1600,
					'-xxxl-': 1800
				},
				responsive = {};

			for (var alias in aliases) {
				var link = responsive[aliases[alias]] = {};
				if (navbar.attr('data' + alias + 'layout')) link.layout = navbar.attr('data' + alias + 'layout');
				if (navbar.attr('data' + alias + 'device-layout')) link.deviceLayout = navbar.attr('data' + alias + 'device-layout');
				if (navbar.attr('data' + alias + 'hover-on')) link.focusOnHover = navbar.attr('data' + alias + 'hover-on') === 'true';
				if (navbar.attr('data' + alias + 'auto-height')) link.autoHeight = navbar.attr('data' + alias + 'auto-height') === 'true';
				if (navbar.attr('data' + alias + 'stick-up-offset')) link.stickUpOffset = navbar.attr('data' + alias + 'stick-up-offset');
				if (navbar.attr('data' + alias + 'stick-up')) link.stickUp = navbar.attr('data' + alias + 'stick-up') === 'true';
				if (isNoviBuilder) link.stickUp = false;
				else if (navbar.attr('data' + alias + 'stick-up')) link.stickUp = navbar.attr('data' + alias + 'stick-up') === 'true';
			}

			plugins.rdNavbar.RDNavbar({
				anchorNav:    !isNoviBuilder,
				stickUpClone: (plugins.rdNavbar.attr("data-stick-up-clone") && !isNoviBuilder) ? plugins.rdNavbar.attr("data-stick-up-clone") === 'true' : false,
				responsive:   responsive,
				callbacks:    {
					onStuck:        function () {
						var navbarSearch = this.$element.find('.rd-search input');

						if (navbarSearch) {
							navbarSearch.val('').trigger('propertychange');
						}
					},
					onDropdownOver: function () {
						return !isNoviBuilder;
					},
					onUnstuck:      function () {
						if (this.$clone === null)
							return;

						var navbarSearch = this.$clone.find('.rd-search input');

						if (navbarSearch) {
							navbarSearch.val('').trigger('propertychange');
							navbarSearch.trigger('blur');
						}

					}
				}
			});
		}
		
		/**
		 * RD Search
		 * @description Enables search
		 */
		if (plugins.search.length || plugins.searchResults) {
			var handler = "bat/rd-search.php";
			var defaultTemplate = '<h5 class="search_title"><a target="_top" href="#{href}" class="search_link">#{title}</a></h5>' +
				'<p>...#{token}...</p>' +
				'<p class="match"><em>Terms matched: #{count} - URL: #{href}</em></p>';
			var defaultFilter = '*.html';
			
			if (plugins.search.length) {
				
				plugins.search = $('.' + plugins.search[0].className);
				
				for (i = 0; i < plugins.search.length; i++) {
					var searchItem = $(plugins.search[i]),
						options = {
							element:   searchItem,
							filter:    (searchItem.attr('data-search-filter')) ? searchItem.attr('data-search-filter') : defaultFilter,
							template:  (searchItem.attr('data-search-template')) ? searchItem.attr('data-search-template') : defaultTemplate,
							live:      (searchItem.attr('data-search-live')) ? (searchItem.find('.' + searchItem.attr('data-search-live'))) : false,
							liveCount: (searchItem.attr('data-search-live-count')) ? parseInt(searchItem.attr('data-search-live')) : 4,
							current:   0,
							processed: 0,
							timer:     {}
						};
					
					if ($('.rd-navbar-search-toggle').length) {
						var toggle = $('.rd-navbar-search-toggle');
						toggle.on('click', function () {
							if (!($(this).hasClass('active'))) {
								searchItem.find('input').val('').trigger('propertychange');
							}
						});
					}
					
					if (options.live) {
						options.clearHandler = false;
						
						searchItem.find('input').on("keyup input propertychange", $.proxy(function () {
							var ctx = this;
							
							this.term = this.element.find('input').val().trim();
							this.spin = this.element.find('.input-group-addon');
							
							clearTimeout(ctx.timer);
							
							if (ctx.term.length > 2) {
								ctx.timer = setTimeout(liveSearch(ctx), 200);
								
								if (ctx.clearHandler == false) {
									ctx.clearHandler = true;
									
									$("body").on("click", function (e) {
										if ($(e.toElement).parents('.rd-search').length == 0) {
											ctx.live.addClass('cleared').html('');
										}
									})
								}
								
							} else if (ctx.term.length == 0) {
								ctx.live.addClass('cleared').html('');
							}
						}, options, this));
					}
					
					searchItem.submit($.proxy(function () {
						$('<input />').attr('type', 'hidden')
							.attr('name', "filter")
							.attr('value', this.filter)
							.appendTo(this.element);
						return true;
					}, options, this))
				}
			}
			
			if (plugins.searchResults.length) {
				var regExp = /\?.*s=([^&]+)\&filter=([^&]+)/g;
				var match = regExp.exec(location.search);
				
				if (match != null) {
					$.get(handler, {
						s:        decodeURI(match[1]),
						dataType: "html",
						filter:   match[2],
						template: defaultTemplate,
						live:     ''
					}, function (data) {
						plugins.searchResults.html(data);
					})
				}
			}
		}

		/**
		 * Enable parallax by mouse
		 */
		var parallaxJs = document.getElementsByClassName('parallax-scene-js');
		if (parallaxJs && !isNoviBuilder) {
			for (var i = 0; i < parallaxJs.length; i++) {
				var scene = parallaxJs[i];
				new Parallax(scene);
			}
		}

		/**
		 * jpFormatePlaylistObj
		 * @description  format dynamic playlist object for jPlayer init
		 */
		function jpFormatePlaylistObj(playlistHtml) {
			var playlistObj = [];

			// Format object with audio
			for (var i = 0; i < playlistHtml.length; i++) {
				var playlistItem = playlistHtml[i],
					itemData = $(playlistItem).data();
				playlistObj[i] = {};

				for (var key in itemData) {
					playlistObj[i][key.replace('jp', '').toLowerCase()] = itemData[key];
				}
			}

			return playlistObj;
		}

		/**
		 * initJplayerBase
		 * @description Base jPlayer init
		 */
		function initJplayerBase(index, item, mediaObj) {
			return new jPlayerPlaylist({
				jPlayer:             item.getElementsByClassName("jp-jplayer")[0],
				cssSelectorAncestor: ".jp-audio-" + index // Need too bee a selector not HTMLElement or Jq object, so we make it unique
			}, mediaObj, {
				playlistOptions:   {
					enableRemoveControls: false
				},
				supplied:          "ogv, m4v, oga, mp3",
				useStateClassSkin: true,
				volume:            0.4
			});
		}

		/**
		 * Jp Audio player
		 * @description  Custom jPlayer script
		 */
		if (plugins.jPlayerInit.length) {
			$html.addClass('ontouchstart' in window || 'onmsgesturechange' in window ? 'touch' : 'no-touch');

			$.each(plugins.jPlayerInit, function (index, item) {
				$(item).addClass('jp-audio-' + index);

				var mediaObj = jpFormatePlaylistObj($(item).find('.jp-player-list .jp-player-list-item')),
					playerInstance = initJplayerBase(index, item, mediaObj);

				if ($(item).data('jp-player-name')) {
					var customJpPlaylists = $('[data-jp-playlist-relative-to="' + $(item).data('jp-player-name') + '"]'),
						playlistItems = customJpPlaylists.find("[data-jp-playlist-item]");

					// Toggle audio play on custom playlist play button click
					playlistItems.on('click', customJpPlaylists.data('jp-playlist-play-on'), function (e) {
						var mediaObj = jpFormatePlaylistObj(playlistItems),
							$clickedItem = $(e.delegateTarget);

						if (!JSON.stringify(playerInstance.playlist) === JSON.stringify(mediaObj) || !playerInstance.playlist.length) {
							playerInstance.setPlaylist(mediaObj);
						}

						if (!$clickedItem.hasClass('playing')) {
							playerInstance.pause();

							if ($clickedItem.hasClass('last-played')) {
								playerInstance.play();
							} else {
								playerInstance.play(playlistItems.index($clickedItem));
							}

							playlistItems.removeClass('playing last-played');
							$clickedItem.addClass('playing');
						} else {
							playlistItems.removeClass('playing last-played');
							$clickedItem.addClass('last-played');
							playerInstance.pause();
						}

					});


					// Callback for custom playlist
					$(playerInstance.cssSelector.jPlayer).bind($.jPlayer.event.play, function (e) {

						var toggleState = function (elemClass, index) {
							var activeIndex = playlistItems.index(playlistItems.filter(elemClass));

							if (activeIndex !== -1) {
								if (playlistItems.eq(activeIndex + index).length !== 0) {
									playlistItems.eq(activeIndex)
										.removeClass('play-next play-prev playing last-played')
										.end()
										.eq(activeIndex + index)
										.addClass('playing');
								}
							}
						};

						// Check if user select next or prev track
						toggleState('.play-next', +1);
						toggleState('.play-prev', -1);

						var lastPlayed = playlistItems.filter('.last-played');

						// If user just press pause and than play on same track
						if (lastPlayed.length) {
							lastPlayed.addClass('playing').removeClass('last-played play-next');
						}
					});


					// Add temp marker of last played audio
					$(playerInstance.cssSelector.jPlayer).bind($.jPlayer.event.pause, function (e) {
						playlistItems.filter('.playing').addClass('last-played').removeClass('playing');

						$(playerInstance.cssSelector.cssSelectorAncestor).addClass('jp-state-visible');
					});

					// Add temp marker that user want to play next audio
					$(item).find('.jp-next')
						.on('click', function (e) {
							playlistItems.filter('.playing, .last-played').addClass('play-next');
						});

					// Add temp marker that user want to play prev audio
					$(item).find('.jp-previous')
						.on('click', function (e) {
							playlistItems.filter('.playing, .last-played').addClass('play-prev');
						});
				}
			});

		}

		/**
		 * Jp Video player
		 * @description  Custom jPlayer video initialization
		 */
		if (plugins.jPlayerVideo.length) {
			$.each(plugins.jPlayerVideo, function (index, item) {
				var $item = $(item);

				$item.find('.jp-video').addClass('jp-video-' + index);

				new jPlayerPlaylist({
					jPlayer:             item.getElementsByClassName("jp-jplayer")[0],
					cssSelectorAncestor: ".jp-video-" + index // Need too bee a selector not HTMLElement or Jq object, so we make it unique
				}, jpFormatePlaylistObj($(item).find('.jp-player-list .jp-player-list-item')), {
					playlistOptions:   {
						enableRemoveControls: false
					},
					size:              {
						width:  "100%",
						height: "auto",
					},
					supplied:          "webmv, ogv, m4v",
					useStateClassSkin: true,
					volume:            0.4
				});

				$(item).find(".jp-jplayer").on('click', function (e) {
					var $this = $(this);
					if ($('.jp-video-' + index).hasClass('jp-state-playing')) {
						$this.jPlayer("pause");
					} else {
						$this.jPlayer("play");
					}
				});

				var initialContainerWidth = $item.width();
				// this is the overall page container, so whatever is relevant to your page

				$window.resize(function () {
					if ($item.width() !== initialContainerWidth) {
						// checks current container size against it's rendered size on every resize.
						initialContainerWidth = $item.width();
						$item.trigger('resize', $item);
						//pass off to resize listener for performance
					}
				});
			});

			$window.on('resize', function (e) {
				$('.jp-video').each(function (index) {
					// find every instance of jplayer using a class in their default markup
					var $parentContainer = $(this).closest('.jp-video-init'),
						// finds jplayers closest parent element from the ones you give it (can chain as many as you want)
						containerWidth = $parentContainer.width(),
						//takes the closest elements width
						ARWidth = 1280,
						ARHeight = 720;

					// Width and height figures used to calculate the aspect ratio (will not restrict your players to this size)

					var aspectRatio = ARHeight / ARWidth;

					var videoHeight = Math.round(aspectRatio * containerWidth);
					// calculates the appropriate height in rounded pixels using the aspect ratio
					$(this).find('.jp-jplayer').width(containerWidth).height(videoHeight);
					// and then apply the width and height!
				});
			})
				.trigger('resize');
		}

		/**
		 * Button Nina
		 * @description Handle button Nina animation effect
		 */
		if (plugins.buttonNina.length && !isNoviBuilder) {
			initNinaButtons(plugins.buttonNina);
		}

		// Google ReCaptcha
		if (plugins.captcha.length) {
			$.getScript("//www.google.com/recaptcha/api.js?onload=onloadCaptchaCallback&render=explicit&hl=en");
		}

		// RD Input Label
		if (plugins.rdInputLabel.length) {
			plugins.rdInputLabel.RDInputLabel();
		}

		// Regula
		if (plugins.regula.length) {
			attachFormValidator(plugins.regula);
		}

		// RD Mailform
		if (plugins.rdMailForm.length) {
			let i, j, k,
				msg = {
					'MF000': 'Successfully sent!',
					'MF001': 'Recipients are not set!',
					'MF002': 'Form will not work locally!',
					'MF003': 'Please, define email field in your form!',
					'MF004': 'Please, define type of your form!',
					'MF254': 'Something went wrong with PHPMailer!',
					'MF255': 'Aw, snap! Something went wrong.'
				};

			for (i = 0; i < plugins.rdMailForm.length; i++) {
				let $form = $(plugins.rdMailForm[i]),
					formHasCaptcha = false;

				$form.attr('novalidate', 'novalidate').ajaxForm({
					data:         {
						"form-type": $form.attr("data-form-type") || "contact",
						"counter":   i
					},
					beforeSubmit: function (arr, $form, options) {
						if (isNoviBuilder)
							return;

						let form = $(plugins.rdMailForm[this.extraData.counter]),
							inputs = form.find("[data-constraints]"),
							output = $("#" + form.attr("data-form-output")),
							captcha = form.find('.recaptcha'),
							captchaFlag = true;

						output.removeClass("active error success");

						if (isValidated(inputs, captcha)) {

							// veify reCaptcha
							if (captcha.length) {
								let captchaToken = captcha.find('.g-recaptcha-response').val(),
									captchaMsg = {
										'CPT001': 'Please, setup you "site key" and "secret key" of reCaptcha',
										'CPT002': 'Something wrong with google reCaptcha'
									};

								formHasCaptcha = true;

								$.ajax({
									method: "POST",
									url:    "bat/reCaptcha.php",
									data:   {'g-recaptcha-response': captchaToken},
									async:  false
								})
									.done(function (responceCode) {
										if (responceCode !== 'CPT000') {
											if (output.hasClass("snackbars")) {
												output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + captchaMsg[responceCode] + '</span></p>')

												setTimeout(function () {
													output.removeClass("active");
												}, 3500);

												captchaFlag = false;
											} else {
												output.html(captchaMsg[responceCode]);
											}

											output.addClass("active");
										}
									});
							}

							if (!captchaFlag) {
								return false;
							}

							form.addClass('form-in-process');

							if (output.hasClass("snackbars")) {
								output.html('<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>');
								output.addClass("active");
							}
						} else {
							return false;
						}
					},
					error:        function (result) {
						if (isNoviBuilder)
							return;

						let output = $("#" + $(plugins.rdMailForm[this.extraData.counter]).attr("data-form-output")),
							form = $(plugins.rdMailForm[this.extraData.counter]);

						output.text(msg[result]);
						form.removeClass('form-in-process');

						if (formHasCaptcha) {
							grecaptcha.reset();
							window.dispatchEvent( new Event( 'resize' ) );
						}
					},
					success:      function (result) {
						if (isNoviBuilder)
							return;

						let form = $(plugins.rdMailForm[this.extraData.counter]),
							output = $("#" + form.attr("data-form-output")),
							select = form.find('select');

						form
							.addClass('success')
							.removeClass('form-in-process');

						if (formHasCaptcha) {
							grecaptcha.reset();
							window.dispatchEvent( new Event( 'resize' ) );
						}

						result = result.length === 5 ? result : 'MF255';
						output.text(msg[result]);

						if (result === "MF000") {
							if (output.hasClass("snackbars")) {
								output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + msg[result] + '</span></p>');
							} else {
								output.addClass("active success");
							}
						} else {
							if (output.hasClass("snackbars")) {
								output.html(' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + msg[result] + '</span></p>');
							} else {
								output.addClass("active error");
							}
						}

						form.clearForm();

						if (select.length) {
							select.select2("val", "");
						}

						form.find('input, textarea').trigger('blur');

						setTimeout(function () {
							output.removeClass("active error success");
							form.removeClass('success');
						}, 3500);
					}
				});
			}
		}
		
		// Swiper
		if (plugins.swiper.length) {
			
			for (let i = 0; i < plugins.swiper.length; i++) {
				
				let
					node = plugins.swiper[i],
					params = parseJSON(node.getAttribute('data-swiper')),
					defaults = {
						speed:      1000,
						loop:       true,
						pagination: {
							el:        '.swiper-pagination',
							clickable: true
						},
						navigation: {
							nextEl: '.swiper-button-next',
							prevEl: '.swiper-button-prev'
						},
						autoplay:   {
							delay: 5000
						}
					},
					xMode = {
						autoplay:      false,
						loop:          false,
						simulateTouch: false
					};
				
				params.on = {
					init: function () {
						setBackgrounds(this);
						setRealPrevious(this);
						initCaptionAnimate(this);
						
						// Real Previous Index must be set recent
						this.on('slideChangeTransitionEnd', function () {
							setRealPrevious(this);
						});
					}
				};
				
				new Swiper( node, Util.merge( isNoviBuilder ? [ defaults, params, xMode ] : [ defaults, params ] ) );
			}
		}

		// Owl carousel
		if (plugins.owl.length) {
			for (let i = 0; i < plugins.owl.length; i++) {
				let
					node = plugins.owl[i],
					params = parseJSON( node.getAttribute( 'data-owl' ) ),
					defaults = {
						items: 1,
						margin: 30,
						loop: true,
						mouseDrag: true,
						stagePadding: 0,
						nav: false,
						navText: [],
						dots: false,
						autoplay: true,
						autoplayTimeout: 3000,
						autoplayHoverPause: true
					},
					xMode = {
						autoplay: false,
						loop: false,
						mouseDrag: false,
						dots: true
					},
					generated = {
						autoplay: node.getAttribute('data-autoplay') === 'true',
						loop: node.getAttribute( 'data-loop' ) !== 'false',
						mouseDrag: node.getAttribute( 'data-mouse-drag' ) !== 'false',
						responsive: {}
					},
					aliases = [ '-', '-sm-', '-md-', '-lg-', '-xl-', '-xxl-' ],
					values =  [ 0, 480, 768, 992, 1200, 1600 ],
					responsive = generated.responsive;

				for ( let j = 0; j < values.length; j++ ) {
					responsive[ values[ j ] ] = {};

					for ( let k = j; k >= -1; k-- ) {
						if ( !responsive[ values[ j ] ][ 'items' ] && node.getAttribute( 'data' + aliases[ k ] + 'items' ) ) {
							responsive[ values[ j ] ][ 'items' ] = k < 0 ? 1 : parseInt( node.getAttribute( 'data' + aliases[ k ] + 'items' ), 10 );
						}
						if ( !responsive[ values[ j ] ][ 'stagePadding' ] && responsive[ values[ j ] ][ 'stagePadding' ] !== 0 && node.getAttribute( 'data' + aliases[ k ] + 'stage-padding' ) ) {
							responsive[ values[ j ] ][ 'stagePadding' ] = k < 0 ? 0 : parseInt( node.getAttribute( 'data' + aliases[ k ] + 'stage-padding' ), 10 );
						}
						if ( !responsive[ values[ j ] ][ 'margin' ] && responsive[ values[ j ] ][ 'margin' ] !== 0 && node.getAttribute( 'data' + aliases[ k ] + 'margin' ) ) {
							responsive[ values[ j ] ][ 'margin' ] = k < 0 ? 30 : parseInt( node.getAttribute( 'data' + aliases[ k ] + 'margin' ), 10 );
						}
					}
				}
				
				// // Initialize lightgallery items in cloned owl items
				// $(node).on('initialized.owl.carousel', function () {
				// 	initLightGalleryItem($(node).find('[data-lightgallery="item"]'), 'lightGallery-in-carousel');
				// });

				node.owl = $( node );
				$( node ).owlCarousel( Util.merge( isNoviBuilder ? [ defaults, params, generated, xMode ] : [ defaults, params, generated ] ) );
			}
		}

		// WOW
		if ($html.hasClass("wow-animation") && plugins.wow.length && !isNoviBuilder && isDesktop) {
			new WOW().init();
		}

		// Google maps
		if (plugins.maps.length) {
			lazyInit(plugins.maps, initMaps);
		}

		// UI To Top
		if (isDesktop && !isNoviBuilder) {
			$().UItoTop({
				easingType:     'easeOutQuad',
				containerClass: 'ui-to-top fa fa-angle-up'
			});
		}

		// Counter
		if (plugins.counter) {
			for (var i = 0; i < plugins.counter.length; i++) {
				var
					node = plugins.counter[i],
					counter = aCounter({
						node:     node,
						duration: node.getAttribute('data-duration') || 1000
					}),
					scrollHandler = (function () {
						if (Util.inViewport(this) && !this.classList.contains('animated-first')) {
							this.counter.run();
							this.classList.add('animated-first');
						}
					}).bind(node),
					blurHandler = (function () {
						this.counter.params.to = parseInt(this.textContent, 10);
						this.counter.run();
					}).bind(node);

				if (isNoviBuilder) {
					node.counter.run();
					node.addEventListener('blur', blurHandler);
				} else {
					scrollHandler();
					window.addEventListener('scroll', scrollHandler);
				}
			}
		}

		// Progress Circle
		if (plugins.progressCircle) {
			for (var i = 0; i < plugins.progressCircle.length; i++) {
				var
					container = plugins.progressCircle[i],
					counter = aCounter({
						node:     container.querySelector('.progress-circle-counter'),
						duration: 500,
						onUpdate: function (value) {
							this.custom.bar.render(value * 3.6);
						}
					});

				counter.params.onComplete = counter.params.onUpdate;

				counter.custom = {
					container: container,
					bar:       aProgressCircle({node: container.querySelector('.progress-circle-bar')}),
					onScroll:  (function () {
						if (Util.inViewport(this.custom.container) && !this.custom.container.classList.contains('animated')) {
							this.run();
							this.custom.container.classList.add('animated');
						}
					}).bind(counter),
					onBlur:    (function () {
						this.params.to = parseInt(this.params.node.textContent, 10);
						this.run();
					}).bind(counter)
				};

				if (isNoviBuilder) {
					counter.run();
					counter.params.node.addEventListener('blur', counter.custom.onBlur);
				} else {
					counter.custom.onScroll();
					window.addEventListener('scroll', counter.custom.onScroll);
				}
			}
		}
		
		// lightGallery
		if (plugins.lightGallery.length) {
			for (let i = 0; i < plugins.lightGallery.length; i++) {
				initLightGallery(plugins.lightGallery[i]);
			}
		}
		
		// lightGallery item
		if (plugins.lightGalleryItem.length) {
			// Filter carousel items
			let notCarouselItems = [];
			
			for (let z = 0; z < plugins.lightGalleryItem.length; z++) {
				if (!$(plugins.lightGalleryItem[z]).parents('.owl-carousel').length &&
					!$(plugins.lightGalleryItem[z]).parents('.swiper-slider').length &&
					!$(plugins.lightGalleryItem[z]).parents('.slick-slider').length) {
					notCarouselItems.push(plugins.lightGalleryItem[z]);
				}
			}
			
			plugins.lightGalleryItem = notCarouselItems;
			
			for (let i = 0; i < plugins.lightGalleryItem.length; i++) {
				initLightGalleryItem(plugins.lightGalleryItem[i]);
			}
		}
		
		// Dynamic lightGallery
		if (plugins.lightDynamicGalleryItem.length) {
			for (let i = 0; i < plugins.lightDynamicGalleryItem.length; i++) {
				initDynamicLightGallery(plugins.lightDynamicGalleryItem[i]);
			}
		}

		// Custom Toggles
		if (plugins.customToggle.length) {
			for (var i = 0; i < plugins.customToggle.length; i++) {
				var $this = $(plugins.customToggle[i]);

				$this.on('click', $.proxy(function (event) {
					event.preventDefault();

					var $ctx = $(this);
					$($ctx.attr('data-custom-toggle')).add(this).toggleClass('active');
				}, $this));

				if ($this.attr("data-custom-toggle-hide-on-blur") === "true") {
					$body.on("click", $this, function (e) {
						if (e.target !== e.data[0]
							&& $(e.data.attr('data-custom-toggle')).find($(e.target)).length
							&& e.data.find($(e.target)).length === 0) {
							$(e.data.attr('data-custom-toggle')).add(e.data[0]).removeClass('active');
						}
					})
				}

				if ($this.attr("data-custom-toggle-disable-on-blur") === "true") {
					$body.on("click", $this, function (e) {
						if (e.target !== e.data[0] && $(e.data.attr('data-custom-toggle')).find($(e.target)).length === 0 && e.data.find($(e.target)).length === 0) {
							$(e.data.attr('data-custom-toggle')).add(e.data[0]).removeClass('active');
						}
					})
				}
			}
		}
	});
}());