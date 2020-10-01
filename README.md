# smart-hoverjs
Smart hover WebComponent inspired on iPad OS contextual cursor.

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

Smart hover component behaves as a regular div container, except it takes a query parameter attribute which lets the container know which children to consider 'hoverable'.

```html
<smart-hover class="category-list" query-selector=".category-list-item">
  <div class="category-list-item">Test 1</div>
  <div class="category-list-item">Test 2</div>
  <div class="category-list-item">Test 3</div>
  <div class="category-list-item">Test 4</div>
</smart-hover>
```

Smart hover component will automatically position itself on top of the elements that where found with the query selector when they are hovered, automatically adapting to their position and size.
<p style="text-align: center; width: 100%">
  <img src="assets/smart-hover-example-1.gif"/>
</p> 

# Customization

Smart hoverjs has default styles applied under the .smart-hover-shadow css class

### Default
```css
.smart-hover-shadow {
  border-radius: 5px;
  background: rgba(0,0,0,0.15);
}
```

Feel free to override this properties or remove them entirely by adding the "override-styles" attribute

```html
<smart-hover class="container" override-styles="true">
    <div class="button">Button 1</div>
    <div class="button">Button 2</div>
    <div class="button">Button 3</div>
</smart-hover>
```

With this attribute default styles avobe will not be applied and you can write your own .smart-hover-shadow class to achieve the styles you want

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

NOTE: There are a few style properties applied programatically that you will not be able to override like left, top, with, height, position, since this ones determine the position of our shadow.

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

### query-selector

Query selector defined here will be used to find the hoverable elements inside the container, all elements found by the query selector will become 'hoverable'. If unset it retrieves all children of the container via parentElement.children property.

### override-styles

If set to "true" default .smart-hover-shadow styles wont be applies (with the exception of the ones applied programatically), this makes it easier to fully customize the style of the smart-hover-shadow element. If unset it will apply the default styles from the .smart-hover-shadow class

### transition-time

Time in milliseconds that the shadow element will take from one element to the next one when hover changes. If unset default value will be set to 180

### transition-props

If you want to apply the transition to specific css properties here, separate them by a comma, ex.
> "left,top,background"