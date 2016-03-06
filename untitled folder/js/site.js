$(function() {
  $(document).ready(function() {
  	
  	// Once the service worker is registered set the initial state  
function initialiseState() {  
  // Are Notifications supported in the service worker?  
  if (!('showNotification' in ServiceWorkerRegistration.prototype)) {  
    console.warn('Notifications aren\'t supported.');  
    return;  
  }

  // Check the current Notification permission.  
  // If its denied, it's a permanent block until the  
  // user changes the permission  
  if (Notification.permission === 'denied') {  
    console.warn('The user has blocked notifications.');  
    return;  
  }

  // Check if push messaging is supported  
  if (!('PushManager' in window)) {  
    console.warn('Push messaging isn\'t supported.');  
    return;  
  }

  // We need the service worker registration to check for a subscription  
  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {  
    // Do we already have a push message subscription?  
    serviceWorkerRegistration.pushManager.getSubscription()  
      .then(function(subscription) {  
        // Enable any UI which subscribes / unsubscribes from  
        // push messages.  
        var pushButton = document.querySelector('.js-push-button');  
        pushButton.disabled = false;

        if (!subscription) {  
          // We aren't subscribed to push, so set UI  
          // to allow the user to enable push  
          return;  
        }

        // Keep your server in sync with the latest subscriptionId
        sendSubscriptionToServer(subscription);

        // Set your UI to show they have subscribed for  
        // push messages  
        pushButton.textContent = 'Disable Push Messages';  
        isPushEnabled = true;  
      })  
      .catch(function(err) {  
        console.warn('Error during getSubscription()', err);  
      });  
  });  
}
//sets up the push notification subscription
function subscribe() {  
  // Disable the button so it can't be changed while  
  // we process the permission request  
  var pushButton = document.querySelector('.js-push-button');  
  pushButton.disabled = true;

  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {  
    serviceWorkerRegistration.pushManager.subscribe()  
      .then(function(subscription) {  
        // The subscription was successful  
        isPushEnabled = true;  
        pushButton.textContent = 'Disable Push Messages';  
        pushButton.disabled = false;

        // TODO: Send the subscription.endpoint to your server  
        // and save it to send a push message at a later date
        return sendSubscriptionToServer(subscription);  
      })  
      .catch(function(e) {  
        if (Notification.permission === 'denied') {  
          // The user denied the notification permission which  
          // means we failed to subscribe and the user will need  
          // to manually change the notification permission to  
          // subscribe to push messages  
          console.warn('Permission for Notifications was denied');  
          pushButton.disabled = true;  
        } else {  
          // A problem occurred with the subscription; common reasons  
          // include network errors, and lacking gcm_sender_id and/or  
          // gcm_user_visible_only in the manifest.  
          console.error('Unable to subscribe to push.', e);  
          pushButton.disabled = false;  
          pushButton.textContent = 'Enable Push Messages';  
        }  
      });  
  });  
}

//sends a message to the push notification
self.addEventListener('push', function(event) {  
  console.log('Received a push message', event);

  var title = 'Yay a message.';  
  var body = 'We have received a push message.';  
  var icon = '/images/icon-192x192.png';  
  var tag = 'simple-push-demo-notification-tag';

  event.waitUntil(  
    self.registration.showNotification(title, {  
      body: body,  
      icon: icon,  
      tag: tag  
    })  
  );  
});












    var el = {
      form: $('#brotherhood')
    };

    el.submit = {
      button: $('input[type=submit]', el.form)
    };

    el.fields = {
      all: $('li:not(:last-child)', el.form),
      required: $('li.required', el.form),
      email: $('li.email', el.form),
      numeric: $('li.numeric', el.form),
      alpha: $('li.alpha', el.form)
    };

    var form = {
      ie: (function() {
        // IE Detection code by James Padolsey
        // https://gist.github.com/padolsey/527683
        var undef,
          v = 3,
          div = document.createElement('div'),
          all = div.getElementsByTagName('i');

        while (
          div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
          all[0]
        );

        return v > 4 ? v : undef;
      }()),

      init: function() {
        // keep valid state
        this.valid = true;

        if (this.ie) {
          el.form.addClass('ie' + this.ie);

          // use classes to target certain elements in ie6
          if (el.form.hasClass('ie6')) {
            el.form.find('input[type=text]').addClass('input-text');
            el.form.find('textarea').addClass('textarea');
          }
        }

        this.events();
      },

      errors: {
        clearAll: function() {
          // clear error messages
          $('.error', el.form).removeClass('error');
          $('.error-message', el.form).remove();
        },

        show: function(message, el) {
          $(el)
            .addClass('error');

          // mark form as invalid
          form.valid = false;
        }
      },

      validate: function() {
        var self = this;

        // reset initial from valid state
        form.valid = true;

        // clear errors
        this.errors.clearAll();

        el.fields.all.each(function(i, el) {
          // get data from fields
          // only input and textarea fields can have validations at the moment
          var data = $(this).find('input, textarea, select').val();

          // check if this field needs validation
          var required = $(el).hasClass('required'),
            email = $(el).hasClass('email'),
            numeric = $(el).hasClass('numeric'),
            alpha = $(el).hasClass('alpha');

          // return early if not a required field and no data to check
          if (!required && !data)
            return;

          if (data === 'null') {
            $('select').parent().removeClass('error');
          }

          // if required and no data filled in, show an error
          if (required && !data)
            return self.errors.show('This field is required', el);

          if (email && !(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(data)))
            return self.errors.show('Please enter a valid email address', el);

          if (numeric && !(/^[0-9]+$/.test(data)))
            return self.errors.show('Please enter a number without spaces, dots or commas', el);

          if (alpha && !(/^[a-zA-Z ]+$/.test(data)))
            return self.errors.show('This field accepts only letters &amp; spaces', el);
        });
      },

      buttonState: {
        active: function() {
          el.submit.button
            .val('Send');
        },
        sending: function() {
          el.submit.button
            .removeClass('sending')
            .addClass('sending')
            .val('Sending');
        },
        failed: function() {
          el.submit.button
            .removeClass('button--green')
            .addClass('button--red')
            .val('Re-send');
        },
        sent: function() {
          el.submit.button
            .removeClass('button--red')
            .addClass('button--green')
            .val('Thank you :)')
            .attr('disabled', true);
        }
      },

      submit: function() {
        var self = this;

        $.post('contact.php', el.form.serialize() + '&request_method=ajax', function(response) {
          // does the word 'PASS' exist in response
          var success = /PASS/.test(response) ? true : false;

          if (success) {
            // form submitted and response received
            setTimeout(function() {
              self.buttonState.sent();
            }, 1000);
          } else {
            // fallback to non-ajax submission
            // since the validation said the form was OK
            // but the server responded with a FAIL
            el.form
              .unbind('submit')
              .submit();
          }
        });
      },

      events: function() {
        var self = this;

        el.form.submit(function() {
          // validate form
          self.validate();
          self.buttonState.sending();

          // submit form if valid
          if (self.valid) {
            self.submit();
          } else {
            setTimeout(function() {
              self.buttonState.failed();
            }, 1000);
          }

          // prevent default action
          return false;
        });
      }
    };

    form.init();

    $('select').change(function() {
      var currentVal = $('select').val();

      if (currentVal != 'null') {
        $('select').parent().addClass('normal');
      }
     });
  });

  function touch() {
   return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
  }

  $('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
});
