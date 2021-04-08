 # azad-wrapper
 
 [![NPM](https://nodei.co/npm/azad-wrapper.png?stars=true)](https://nodei.co/npm/azad-wrapper/)
 
 # About
Utility to create wrapper route handler based on the instructions provided. It makes the api call, builds the response and sends it.

# Installation
   ```npm i azad-wrapper```

# Usage

### example :-

 ```js
const express = require('express');
const azad_wrapper = require('azad-wrapper');

const app = express();

// get is set the default method in azad_wrapper 
const handler_one = azad_wrapper('https://example.com/endpoint/one');
const handler_two = azad_wrapper({'https://example.com/endpint/two', method: 'post'});

app.get('/wrapper/one', handler_one);
app.post('/wrapper/two', handler_two);

app.use(azad_wrapper.error_handler('dev'));

app.listen(3000, () => {
  console.log('server is running on port 3000.');
})
  ```
  for a set of apis which have same base_url and requires same headers and auth
  ```js
azad_wrapper.set_base_url('https://example.com');
azad_wrapper.set_headers('something');
azad_wrapper.set_auth('something');
```
  
  or use **`config`** method to set all at once
  
  ```js
    azad_wrapper.config({
            base_url: 'https://example.com',
            headers: 'something',
            auth: 'something'
            })
  ```
  
  you can also use like this:-
  ```js
  const {set_base_url, set_headers, set_auth, config, wrapper, error_handler} = require('azad-wrapper');
  
  set_base_url('https://example.com');
  set_headers('something');
  set_auth('something');
  
  const handler = wrapper({endpoint: '/example/endpint/two', method: 'post'});
  
  router.get('/wrapper', handler);
  ```
  
  ### other options that can be passed in the wrapper :-
  ```js
    const handler = wrapper({
        url: 'http://example.com/endpoint',
        endpoint: '/endpoint',
        auth: 'auth',
        headers: 'headers',
        method: 'method',
        path_params: 'path_param',
        query_params: 'query_param',
        required_fields: 'required_fields',
        response_map: 'response_map',
        transform_response: 'transform_response'      
    });
  ```
  > **endpoint** :- before passing the endpoint set the base_url first using set_base_url method. Or pass the complete url.
   ```js
  set_base_url('http://example.com');
  const handler = wrapper({
                  endpoint: '/endpoint',
                  method: 'get',
                  auth: 'auth',
                  headers: 'headers'
                 });
  ```
      
 > **url, method, auth and headers** are pretty much simple.
 
 > **required_fields** :- if your wrapper needs some required parameters in the request body, put all those fields in a array.
 azad_wrapper will check if those fields are not provided, it will send an error.
 ```js
    const handler = azad_wrapper({
          url: 'http://example.com',
          method: 'post',
          required_fields: ['field_one', 'field_two', 'field_three']
    })
 ```
 
 > **path_params** :- If url has some path params then enclose them in { }. After that you can provide the value to them using path_params property.
 
 ```js
 // if you are using the same field name in your request body or query 
 const handler = wrapper({
     url: 'http://example.com/api/{path_param_one}/a/{path_param_two}/b',
     path_params: {
        params: ['path_param_one', 'path_param_two'], // put all the params names in params array
        value_from: 'body' // or value_from: 'query'
     }
     
  // if you are using different field names in your request body or query then use map property to map the values.
  const handler = wrapper({
     url: 'http://example.com/api/{path_param_one}/a/{path_param_two}/b',
     path_params: {
        params: ['path_param_one', 'path_param_two'], // put all the params names in params array
        value_from: 'body', // or value_from: 'query'
        map: {
          path_param_one: 'your_field_name_one',  // key will be the path_param name and the value will be your field name
          path_param_two: 'your_field_name_two'
        }
     }
 });
 ```
 
 
 > **query_params** :- If url has some query params then you can provide the value to them using query_params property.
 
 ```js
 // if you are using the same field name in your request body or query 
 const handler = wrapper({
     url: 'http://example.com/api',
     path_params: {
        params: ['query_param_one', 'query_param_two'], // put all the params names in params array
        value_from: 'body' // or value_from: 'query'
     }
     
  // if you are using different field names in your request body or query then use map property to map the values.
  const handler = wrapper({
     url: 'http://example.com/api',
     query_params: {
        params: ['query_param_one', 'query_param_two'], // put all the params names in params array
        value_from: 'body', // or value_from: 'query'
        map: {
          query_param_one: 'your_field_name_one', // key will be the query_param name and the value will be your field name
          query_param_two: 'your_field_name_two'
        }
     }
 });
 ```
 > **response_map** :- If you want a different response, provide the map object in the response_map. azad-wrapper uses [object-mapper](https://www.npmjs.com/package/object-mapper)
 for mapping the response. So check [object-mapper's documentation](https://www.npmjs.com/package/object-mapper) for a detailed information. You
 can also change the response with the `transform_response` function. Here I am giving a little bit information
 that how to construct map object.
 ```js
  /*  
    if response object is :-
        response = {
          name: 'iron man',
          from: 'Marvel Studios',
          work: 'to save the world.'
        }
        
   and you want response like this :-
        response = {
          i_am: 'iron_man',
          from: 'Marvel Studios',
          my_work_is: 'to save the world.'
        }
    then the map object will be like below code:-
  */
  
  const handler = azad_wrapper({
      url: 'http://example.com',
      method: 'post',
      response_map: {
        name: 'i_am',  // key will be same and the value will be the new field you want.
        from: 'from',
        work: 'my_work_is'
      }
  })
 ```
 
 > **transform_response** :- Here you have full control on the response. Its a function. first argument is the response data returned from the api call and the second argument is the request itself.
  The returned value of this function will be sent as the final response of the wrapper. `response_map` will have no effect if `transform_response` function is present.
  
  ```js
     const handler = azad_wrapper({
      url: 'http://example.com',
      method: 'post',
      transform_response: (response, request) => {
        return 'hello ' + request.body.name;
  })
  ```
  
  ## error handling :-
  azad_wrapper has a `error_handler` method. in dev env, it will send the error stack. In prod, it wont send error stack.
  
  ```js
  const { error_handler } = require('azad-wrapper');
  app.use(error_handler('dev'));  // app.use(error_handler('prod'));
  
  
  /*
    in dev, error will be like this :-
    {
      error: {
        status: 'status_code',
        message: 'error_message',
        stack: 'error stack'
      }
    }
    
    in prod, error will be like this :-
     {
      error: {
        status: 'status_code',
        message: 'failed to make http request. plz try again.',
      }
    }
    
    the prod error message is fixed to the above one. if you want to change the message use like this :-
    
    app.use(error_handler('prod', 'some message')); 
  */
  ```
  
  ## Methods :-
  > **config** :- sets configs for a set of apis
  ```js
    const { config } = require('azad-wrapper');
    config({
      base_url: 'http://example.com',
      auth: 'auth',
      headers: 'headers'
    });
  ```
  
  
  > **set_base_url** :- it sets the base_url for a set of apis.
  
  ```js
    const { set_base_url } = require('object-mapper');
    set_base_url('http://example.com');
  ```
  
  > **set_auth** :- sets auth for a set of apis.
  ```js
    const { set_auth } = require('object-mapper');
    set_auth('auth');
  ```
  
   > **set_headers** :- sets headers for a set of apis.
  ```js
    const { set_headers } = require('object-mapper');
    set_headers('auth');
  ```
  
  
   > **wrapper** :- generates the route handler.
  ```js
    const { wrapper } = require('object-mapper');
    const handler = wrapper('http://example.com');
    
    app.get('/wrapper', handler);
  ```
  
     > **error_handler** :- its a middleware which handles the errors.
  ```js
    const { error_handler } = require('object-mapper');
    
    app.use(error_handler('dev'));
  ```
  
  
  