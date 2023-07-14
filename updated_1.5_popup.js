

document.addEventListener('DOMContentLoaded', () => {
  let tablist = [];
  let clickListener; // Declare the clickListener outside the getPageSource function
  // Counter variable for active event listeners

  chrome.windows.getAll({ populate: true }, function(windows) {
    const ul = document.getElementById('tabList');
    ul.innerHTML = '';

    // Iterate through all windows and get the tabs in each window.
    for (let i = 0; i < windows.length; ++i) {
      const w = windows[i];

      for (let j = 0; j < w.tabs.length; ++j) {
        const t = w.tabs[j];
        // Do something with the tab, such as log its ID.
        console.log('Tab ID: ', t.id);

        // Create a closure to capture the value of 't' for each iteration
        (function(tab) {
          const d = {};
          const li = document.createElement('li');
          d[tab.title] = tab.id;
          const tabInfo = tab.id + '-' + tab.title; // Combine tab ID and webpage title
          li.textContent = tab.title;
          li.addEventListener('click', function() {
            getPageSource(tab.title, d);
          });
          ul.appendChild(li);
        })(t);
      }
    }
  });

  async function getPageSource(tabInfo, d) {
    const extractedList = tabInfo.split('-');
    const tabId = d[tabInfo];
    chrome.tabs.update(tabId, { active: true });
    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: () => {
        // Function to get the CSS selector of an element
        document.removeEventListener('click', clickListener);
        function getCSSSelector(element) {
          const selector = [];
          while (element && element.nodeType === Node.ELEMENT_NODE) {
            let path = element.nodeName.toLowerCase();
            if (element.id) {
              path += `#${element.id}`;
              selector.unshift(path);
              break;
            } else {
              let sibling = element;
              let index = 1;
              while (sibling && sibling.nodeType === Node.ELEMENT_NODE) {
                sibling = sibling.previousElementSibling;
                if (sibling && sibling.nodeName.toLowerCase() === path) {
                  index++;
                }
              }
              if (index > 1) {
                path += `:nth-of-type(${index})`;
              }
            }
            selector.unshift(path);
            element = element.parentNode;
          }
          return selector.join(' > ');
        }
        
        // Define the clickListener function
        function clickListener(event) {
          
          const xpath = getCSSSelector(event.target);

          fetch("http://127.0.0.1:8000/capture_xpath", {
            method: "POST",
            body: JSON.stringify({ xpath: xpath })
          })
            .then(function(response) {
              // Handle the response from the backend if needed
            })
            .catch(function(error) {
              console.error("Error:", error);
            });

          console.log('Clicked element XPath:', xpath);
          const htmlContent = document.documentElement.outerHTML;
          
          fetch("http://127.0.0.1:8000/extract_page", {
            method: "POST",
            body: JSON.stringify({ htmlContent: htmlContent })
          })
            .then(function(response) {
              // Handle the response from the backend if needed
            })
            .catch(function(error) {
              console.error("Error:", error);
            });

          // Remove the click event listener after each click
          document.removeEventListener('click', clickListener);
          // Decrement the counter after removing the listener

          // Add the click event listener back to wait for the next click
          document.addEventListener('click', clickListener);
          // Increment the counter after adding the listener
        }

        // Add the initial click event listener
        document.addEventListener('click', clickListener);
        // Increment the counter after adding the listener
      }
    });

    
  }

  const closeButton = document.getElementById('closeButton');
  closeButton.addEventListener('click', function() {
    // Remove the click event listener when the close button is clicked
    document.removeEventListener('click', clickListener);
    // Decrement the counter after removing the listener

    window.close();
  });

  function getPageSourceCode() {
    const html = document.documentElement.outerHTML;
    if (html === undefined) {
      return '';
    } else {
      return html;
    }
  }

  // Function to get the count of active event listeners
  function getEventListenerCount() {
    return eventListenerCount;
  }
});