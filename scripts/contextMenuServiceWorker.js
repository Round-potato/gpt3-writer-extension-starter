

const getKey = () => {
  return new Promise((resolve, reject) => {
      chrome.storage.local.get(['openai-key'], (result) => {
        console.log("Let me live")
        if (result['openai-key']) {
          console.log("pleaseeeee run, its been too long")
          const decodedKey = atob(result['openai-key']);
          resolve(decodedKey);
          }
      });
  });
};

const sendMessage = (content) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].id) {
      const activeTab = tabs[0].id;
      console.log("blah", typeof tabs[0].id)
  
      if (activeTab) {
        console.log(activeTab);
        chrome.tabs.sendMessage(
          activeTab,
          { message: 'inject', content:content },
          (response) => {
            console.log(response);
            if (response && response.status === 'failed') {
              console.log('injection failed.', content);
            }
          }
        );
        console.log("prajwal that goat")
      }
    }
  });
  return true;
}; 


const generate = async (prompt) => {
  const payload = {
    model: 'gpt-3.5-turbo',
    temperature: 0.85,
    max_tokens: 1250,
    messages: [
      { role: 'system', 
      content: `You're the world's most helpful tutor and you are an assistant to a student who needs their explanations to be intuitive, and also wants your help for vocabulary and literature writing. Some times you will be offer a few words or a phrase, in which you should first perform spell check, and then explain its meaning or definition, as well as sourcing your own understanding. In other occasions, you may be given a long sequence of sentences, paragraphs of text or whole pieces of literature, in those situations your job is to condense the information and cite important parts. Summarize and reason your logic. The last situation you will encounter is if your input starts with "Essay this (with citation): " or "Essay this (without citation): "if you see these, take whatever comes after and use it as a starting point for writing an essay. If it states there need to be citation make sure you create a citation section in APA format and include in text citations for where you get your details. If the initial input does not require proper citation, make sure 100% that you still include all the sources you've used to write your essay. \n **When citing sources, do not say that any writing was original work by AI because it isn't. Try to find any and all sources you can to include in citation.`
      },
      { role: 'user', 
      content: prompt
      },
    ]
    
  };
  console.log("a testing")
  const key = await getKey();
  console.log("love javascript")
  const url = 'https://api.openai.com/v1/chat/completions';
	
  const completionResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${key}`,
      //'OpenAI-Beta': 'assistants=v1'
    },
    body: JSON.stringify(payload),
  });
	console.log("baba test")
  const completion = await completionResponse.json();
  console.log(completion)
  return completion.choices.pop();
}

const generateCompletionAction = async (info) => {
    try {
      console.log("logging")
      console.log(sendMessage('generating...'))
      //sendMessage("blue moon")
      console.log(info)
        const selectionText = info.selectionText;
        console.log(selectionText)
        console.log("blah",info);
        const baseCompletion = await generate(selectionText);
        console.log(baseCompletion.message.content)
        const secondPrompt = {
          model: 'gpt-3.5-turbo',
          temperature: 0.85,
          max_tokens: 1250,
          messages: [
            { role: 'system', 
            content: `You're the world's most helpful tutor and you are an assistant to a student who needs their explanations to be intuitive, and also wants your help for vocabulary and literature writing. Some times you will be offer a few words or a phrase, in which you should first perform spell check, and then explain its meaning or definition, as well as sourcing your own understanding. In other occasions, you may be given a long sequence of sentences, paragraphs of text or whole pieces of literature, in those situations your job is to condense the information and cite important parts. Summarize and reason your logic. The last situation you will encounter is if your input starts with "Essay this (with citation): " or "Essay this (without citation): "if you see these, take whatever comes after and use it as a starting point for writing an essay. If it states there need to be citation make sure you create a citation section in APA format and include in text citations for where you get your details. If the initial input does not require proper citation, make sure 100% that you still include all the sources you've used to write your essay. \n **When citing sources, do not say that any writing was original work by AI because it isn't. Try to find any and all sources you can to include in citation.`
            },
            { role: 'user', 
            content: info.selectionText
            },
            { role: 'assistant', 
            content: `${baseCompletion}`
            },
            { role: 'user', 
            content: "You are a PhD in linguistics and is a master of langage, for every definition required you will offer both the definiton and synonyms. You analyze essays by summarizing the most important points/details as well as quoting imteresting sections and passages and offer insights on how essays could be structured. You like to draw connections between given summary points and you create your own understanding of how seperate points could be made to interconnect and weave a greate essay. You response will be based off of the privious response. Keep in mind not to go overboard with analysis when it's just one vocabulary word"
            },
          ]
          
        };
        const key = await getKey();
        const url = 'https://api.openai.com/v1/chat/completions';
        
        const  completionResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${key}`,
            //'OpenAI-Beta': 'assistants=v1'
          },
          body: JSON.stringify(secondPrompt),
        });
        const completion = await completionResponse.json();

        const secondCompletion = (completion.choices.pop());
        console.log(typeof secondCompletion.message.content);


        sendMessage(secondCompletion.message.content);
      } catch (error) {
        console.log("hehehe")
        console.log(error);
        sendMessage(error.toString());
      }
  };

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'context-run',
      title: 'Generate blog post',
      contexts: ['selection'],
    });
});

chrome.contextMenus.onClicked.addListener(generateCompletionAction);