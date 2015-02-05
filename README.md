# Reactify Stylify

Stylify is a transform step that will go into your React createClass calls, find a `styles` definition, run it through LESS and replace it with the resulting AST.

**INCOMPLETE**

It gets to the point it dumps the LESS AST tree object as JSON, but when restoring the structure, the basic objects need to be converted to LESS objects (less.tree.Rule, less.tree.Selector, etc.). Additionally, the AST is huge. Minified, it's about 4x larger than the LESS string. I started working on restoring it this way, but due to that, haven't gone further:

```js
getInitialState: function() {
    var parser = less.Parser();

    try {
        // Create a dummy tree and later replace its rules with our rules
        parser.parse('dummy {}', function(err, tree) {
          if (err) {
            console.error(err);
          }

          tree.rules = this.styles.rules;
          tree.selectors = this.styles.selectors;

          this.styles = tree;
        }.bind(this));
    }
    catch (err) {
      console.error(err);
    }
}
```

Given a React component of this structure:

```js
var TodoApp = React.createClass({
  styles: Helpers.styles(`
    html,
    body {
      margin: 0;
      padding: 0;
    }

    body {
      font: 14px 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.4em;
      background: #eaeaea url('todomvc-common/bg.png');
      color: #4d4d4d;
      width: 550px;
      margin: 0 auto;
      -webkit-font-smoothing: antialiased;
      -moz-font-smoothing: antialiased;
      -ms-font-smoothing: antialiased;
      -o-font-smoothing: antialiased;
      font-smoothing: antialiased;
    }

    #todoapp {
      background: #fff;
      background: rgba(255, 255, 255, 0.9);
      margin: 130px 0 40px 0;
      border: 1px solid #ccc;
      position: relative;
      border-top-left-radius: 2px;
      border-top-right-radius: 2px;
      box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.2),
            0 25px 50px 0 rgba(0, 0, 0, 0.15);
    }

    #todoapp:before {
      content: '';
      border-left: 1px solid #f5d6d6;
      border-right: 1px solid #f5d6d6;
      width: 2px;
      position: absolute;
      top: 0;
      left: 40px;
      height: 100%;
    }


    #todo-count {
      float: left;
      text-align: left;
    }
  `),

  getInitialState: function() {
    return getTodoState();
  },

  /**
   * @return {object}
   */
  render: function() {
    var style = Object.assign(
      {},
      this.styles['html, body'],
      this.styles['body']
    );

    return (
      <div style={style}>
        <div style={this.styles['#todoapp']}>
          <div style={this.styles['#todoapp:before']}></div>
          <Header />
          <MainSection
            allTodos={this.state.allTodos}
            areAllComplete={this.state.areAllComplete}
          />
          <Footer allTodos={this.state.allTodos} />
        </div>
        <div style={this.styles['#info']}>
          <p>Double-click to edit a todo</p>
          <p>Created by <a href="http://facebook.com/bill.fisher.771" style={this.styles['#info a']}>Bill Fisher</a></p>
          <p>Part of <a href="http://todomvc.com" style={this.styles['#info a']}>TodoMVC</a></p>
        </div>
      </div>
    );
  },

  /**
   * Event handler for 'change' events coming from the TodoStore
   */
  _onChange: function() {
    this.styles.refresh();

    this.setState(getTodoState());
  }

});
```

## Getting started

Add `reactify-stylify` as part of the Browserify transform steps:

```js
  "browserify": {
    "transform": [
      "reactify",
      "envify",
      "reactify-stylify"
    ]
  },
```
