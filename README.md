# smart-hoverjs
smart-hoverjs WebComponent inspired on iPad OS contextual cursor.

# Install
`npm -i smart-hoverjs`

# Import
To use the web component simply import it in your main or app file like so:

```javascript
import 'smart-hoverjs'
```

Or include it in your index.html file

```javascript
<script src="./node_modules/smart-hoverjs/dist/index.js">
```

# Use

smart-hoverjs component behaves as a regular div container, except it can take a few attributes that can define certain behaviors and its style.

```html
<smart-hover class="category-list">
  <div class="category-list-item">Test 1</div>
  <div class="category-list-item">Test 2</div>
  <div class="category-list-item">Test 3</div>
  <div class="category-list-item">Test 4</div>
</smart-hover>
```

Smart hover component will automatically position itself on top of the elements that where found with the query selector when they are hovered, automatically adapting to their position and size. The smart hover element will be appended programatically with the class ".smart-hover-shadow" with the defautl styles applied.

```css
.smart-hover-shadow {
  border-radius: 5px;
  background: rgba(0,0,0,0.15);
}
```

<p style="text-align: center; width: 100%">
  <img src="https://firebasestorage.googleapis.com/v0/b/smart-hoverjs.appspot.com/o/smart-hover-example-1.gif?alt=media&token=d7d2f46a-b0fa-4ad9-9db3-71838c182e15"/>
</p> 

# Customization

Smart hoverjs has default styles applied under the .smart-hover-shadow css class

Feel free to override this properties or remove them entirely by adding the "override-styles" attribute

```html
<smart-hover class="container" override-styles="true">
    <div class="button">Button 1</div>
    <div class="button">Button 2</div>
    <div class="button">Button 3</div>
</smart-hover>
```

With this attribute set to "true", default styles above will not be applied and you can write your own .smart-hover-shadow class to achieve the styles you want

```css
.container {
    width: 310px;
    height: 30px;
    position: absolute;
    text-align: center;
}

.container > .button {
    width: 100px;
    height: 30px;
    display: inline-block;
    cursor: pointer;
}

.smart-hover-shadow {
    border-bottom: rgb(46, 46, 46);
    border-bottom-width: 3px;
    border-bottom-style: solid;
}
```

</br>
</br>

<p style="text-align: center; width: 100%">
  <img src="https://firebasestorage.googleapis.com/v0/b/smart-hoverjs.appspot.com/o/smart-hover-example-3.gif?alt=media&token=51a3bd2f-3b36-414c-bed5-5f74bd81b908"/>
</p> 

</br>
</br>

# Restrictions

NOTE: There are a few style properties applied programatically that you will not be able to override like left, top, with, height.
The shadow element also has by default absolute position and pointer events set to none, to avoid problems with your hoverable elements

# Attributes

```html
<smart-hover
  query-selector=""
  override-styles=""
  transition-time=""
  transition-mode=""
  transition-props="">
</smart-hover>
```

### <code>query-selector</code>

Query selector defined here will be used to find the hoverable elements inside the container, all elements found by the query selector will become 'hoverable'. If unset it retrieves all children of the container via parentElement.children property.

```html
<smart-hover query-selector=".item-list"></smart-hover>
```

### <code>override-styles</code>

If set to "true" default .smart-hover-shadow styles wont be applies (with the exception of the ones applied programatically), this makes it easier to fully customize the style of the smart-hover-shadow element. If unset it will apply the default styles from the .smart-hover-shadow class.

```html
<smart-hover override-styles="true | false"></smart-hover>
```

### <code>transition-props</code>

If you want to apply the transition to specific css properties, you can apply them by adding them in this attribute, separating them with a comma.

```html
<smart-hover transition-props="left,top,height,width"></smart-hover>
```

### <code>transition-time</code>

Time in milliseconds that the shadow element will take from one element to the next one when hover changes. If unset default value will be set to 180.

```html
<smart-hover transition-time="200 | 180 | 340"></smart-hover>
```

### <code>transition-mode</code>

Transition mode can be any valid css transition timing functiontype
https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function

```html
<smart-hover transition-mode="ease | ease-in-out"></smart-hover>
```