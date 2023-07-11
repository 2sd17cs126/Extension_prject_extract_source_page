document.addEventListener('DOMContentLoaded', () => {
  tablist=[]
  chrome.windows.getAll({ populate: true }, function(windows) {
    const ul = document.getElementById('tabList');
    ul.innerHTML = '';
  
    // Iterate through all windows and get the tabs in each window.
    for (var i = 0; i < windows.length; ++i) {
      var w = windows[i];
  
      for (var j = 0; j < w.tabs.length; ++j) {
        var t = w.tabs[j];
        // Do something with the tab, such as log its ID.
        console.log('Tab ID: ', t.id);
        
        // Create a closure to capture the value of 't' for each iteration
        (function(tab) {
          var d={}
          const li = document.createElement('li');
          d[tab.title]=tab.id
          const tabInfo = tab.id + '-' + tab.title; // Combine tab ID and webpage title
          li.textContent = tab.title;
          li.addEventListener('click', function() {
            getPageSource(tab.title,d);
          });
          ul.appendChild(li);
        })(t);
      }
    }
  });
  
    
    
    
    async function getPageSource(tabInfo,d) {
      
      const extracted_list=tabInfo.split('-')
      // const tabId=parseInt(extracted_list[0])
      const tabId=d[tabInfo]
      chrome.tabs.update(tabId, { active: true });
      chrome.scripting.executeScript({
        target: { tabId: tabId},
        function: () => {
          // Function to get the XPath of an element
          function getXPath(element) {
            console.log("hi")
            const xpath = [];
            while (element && element.nodeType === Node.ELEMENT_NODE) {
              let path = element.nodeName.toLowerCase();
              if (element.id) {
                path += `[@id="${element.id}"]`;
                xpath.unshift(path);
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
                path += `[${index}]`;
              }
              xpath.unshift(path);
              element = element.parentNode;
            }
            
            return xpath.join('/');
          }
  
          // Add click event listener to all elements on the page
          document.addEventListener('click', function(event) {
            const xpath = getXPath(event.target);
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
          });
        }
      }, function(result) {
        const htmlContent = result[0].result;
        console.log(htmlContent);
      
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
      })
     
      

}
var closeButton = document.getElementById('closeButton');
closeButton.addEventListener('click', function() {
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
    
  });