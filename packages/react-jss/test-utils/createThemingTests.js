/* eslint-disable global-require, react/prop-types */

import expect from 'expect.js'
import React from 'react'
import TestRenderer from 'react-test-renderer'

import {createTheming, ThemeProvider, JssProvider, SheetsRegistry} from '../src'

export default ({createStyledComponent}) => {
  const themedStaticStyles = theme => ({
    rule: {
      color: theme.color
    }
  })
  const themedDynamicStyles = theme => ({
    rule: {
      color: theme.color,
      backgroundColor: props => props.backgroundColor
    }
  })
  const ThemeA = {color: '#aaa'}
  const ThemeB = {color: '#bbb'}

  const ThemedStaticComponent = createStyledComponent(themedStaticStyles)
  const ThemedDynamicComponent = createStyledComponent(themedDynamicStyles)

  describe('injecting the theme', () => {
    let injectedTheme
    const defaultProps = {
      getTheme: theme => {
        injectedTheme = theme
      }
    }

    it('should not inject theme with static classes', () => {
      const StyledComponent = createStyledComponent({})
      StyledComponent.defaultProps = defaultProps
      TestRenderer.create(
        <ThemeProvider theme={ThemeA}>
          <StyledComponent />
        </ThemeProvider>
      )
      expect(injectedTheme).to.be(undefined)
    })

    it('should not inject theme with themed classes', () => {
      const StyledComponent = createStyledComponent(() => ({}))
      StyledComponent.defaultProps = defaultProps
      TestRenderer.create(
        <ThemeProvider theme={ThemeA}>
          <StyledComponent />
        </ThemeProvider>
      )
      expect(injectedTheme).to.be(undefined)
    })

    it('should inject theme with static classes and injectTheme option', () => {
      const StyledComponent = createStyledComponent({}, {injectTheme: true})
      StyledComponent.defaultProps = defaultProps
      TestRenderer.create(
        <ThemeProvider theme={ThemeA}>
          <StyledComponent />
        </ThemeProvider>
      )
      expect(injectedTheme).to.equal(ThemeA)
    })

    it('should inject theme with themed classes and injectTheme option', () => {
      const StyledComponent = createStyledComponent(() => ({}), {injectTheme: true})
      StyledComponent.defaultProps = defaultProps
      TestRenderer.create(
        <ThemeProvider theme={ThemeA}>
          <StyledComponent />
        </ThemeProvider>
      )
      expect(injectedTheme).to.equal(ThemeA)
    })

    it('should use the passed theme instead of the actual theme', () => {
      const StyledComponent = createStyledComponent(() => ({}), {injectTheme: true})
      StyledComponent.defaultProps = defaultProps
      TestRenderer.create(
        <ThemeProvider theme={ThemeA}>
          <StyledComponent theme={ThemeB} />
        </ThemeProvider>
      )
      expect(injectedTheme).to.equal(ThemeB)
    })
  })

  it('should have correct meta attribute for themed styles', () => {
    let sheet
    const generateId = (rule, s) => {
      sheet = s
      return rule.key
    }
    TestRenderer.create(
      <JssProvider generateId={generateId}>
        <ThemeProvider theme={ThemeA}>
          <ThemedStaticComponent />
        </ThemeProvider>
      </JssProvider>
    )

    expect(sheet.options.meta.includes('Themed')).to.be(true)
  })

  it('one themed instance wo/ dynamic props = 1 style', () => {
    const registry = new SheetsRegistry()
    TestRenderer.create(
      <JssProvider registry={registry}>
        <ThemeProvider theme={ThemeA}>
          <ThemedStaticComponent />
        </ThemeProvider>
      </JssProvider>
    )
    expect(registry.registry.length).to.equal(1)
  })

  it('one themed instance w/ dynamic props = 2 styles', () => {
    const registry = new SheetsRegistry()
    TestRenderer.create(
      <JssProvider registry={registry}>
        <ThemeProvider theme={ThemeA}>
          <ThemedDynamicComponent backgroundColor="#fff" />
        </ThemeProvider>
      </JssProvider>
    )

    expect(registry.registry.length).to.equal(1)
  })

  it('one themed instance wo/ = 1 style, theme update = 1 style', () => {
    const registry = new SheetsRegistry()
    const renderer = TestRenderer.create(
      <ThemeProvider theme={ThemeA}>
        <JssProvider registry={registry}>
          <ThemedStaticComponent />
        </JssProvider>
      </ThemeProvider>
    )

    expect(registry.registry.length).to.equal(1)

    renderer.update(
      <ThemeProvider theme={ThemeB}>
        <JssProvider registry={registry}>
          <ThemedStaticComponent />
        </JssProvider>
      </ThemeProvider>
    )

    expect(registry.registry[0].attached).to.be(false)
    expect(registry.registry.length).to.equal(2)
  })

  it('one themed instance w/ dynamic props = 2 styles, theme update = 2 styles', () => {
    const registry = new SheetsRegistry()
    const renderer = TestRenderer.create(
      <ThemeProvider theme={ThemeA}>
        <JssProvider registry={registry}>
          <ThemedDynamicComponent backgroundColor="#fff" />
        </JssProvider>
      </ThemeProvider>
    )

    expect(registry.registry.length).to.equal(1)

    renderer.update(
      <ThemeProvider theme={ThemeB}>
        <JssProvider registry={registry}>
          <ThemedDynamicComponent backgroundColor="#fff" />
        </JssProvider>
      </ThemeProvider>
    )

    expect(registry.registry[0].attached).to.be(false)
    expect(registry.registry.length).to.equal(2)
  })

  it('two themed instances wo/ dynamic props w/ same theme = 1 style', () => {
    const registry = new SheetsRegistry()
    TestRenderer.create(
      <JssProvider registry={registry}>
        <ThemeProvider theme={ThemeA}>
          <ThemedStaticComponent />
          <ThemedStaticComponent />
        </ThemeProvider>
      </JssProvider>
    )

    expect(registry.registry.length).to.equal(1)
  })

  it('two themed instances w/ dynamic props w/ same theme = 3 styles', () => {
    const registry = new SheetsRegistry()
    TestRenderer.create(
      <JssProvider registry={registry}>
        <ThemeProvider theme={ThemeA}>
          <ThemedDynamicComponent backgroundColor="#fff" />
          <ThemedDynamicComponent backgroundColor="#fff" />
        </ThemeProvider>
      </JssProvider>
    )

    expect(registry.registry.length).to.equal(1)
  })

  it('two themed instances w/ dynamic props w/ same theme = 3 styles, theme update = 3 styles', () => {
    const registry = new SheetsRegistry()
    const renderer = TestRenderer.create(
      <ThemeProvider theme={ThemeA}>
        <JssProvider registry={registry}>
          <ThemedDynamicComponent backgroundColor="#fff" />
          <ThemedDynamicComponent backgroundColor="#fff" />
        </JssProvider>
      </ThemeProvider>
    )

    expect(registry.registry.length).to.equal(1)

    renderer.update(
      <ThemeProvider theme={ThemeB}>
        <JssProvider registry={registry}>
          <ThemedDynamicComponent backgroundColor="#fff" />
          <ThemedDynamicComponent backgroundColor="#fff" />
        </JssProvider>
      </ThemeProvider>
    )

    expect(registry.registry[0].attached).to.equal(false)
    expect(registry.registry.length).to.equal(2)
  })

  it('two themed instances wo/ dynamic props w/ same theme = 1 styles, different theme update = 2 styles', () => {
    const registry = new SheetsRegistry()
    const renderer = TestRenderer.create(
      <JssProvider registry={registry}>
        <ThemeProvider theme={ThemeA}>
          <ThemedStaticComponent />
        </ThemeProvider>
        <ThemeProvider theme={ThemeA}>
          <ThemedStaticComponent />
        </ThemeProvider>
      </JssProvider>
    )

    expect(registry.registry.length).to.equal(1)

    renderer.update(
      <JssProvider registry={registry}>
        <ThemeProvider theme={ThemeA}>
          <ThemedStaticComponent />
        </ThemeProvider>
        <ThemeProvider theme={ThemeB}>
          <ThemedStaticComponent />
        </ThemeProvider>
      </JssProvider>
    )

    expect(registry.registry.length).to.equal(2)
  })

  it('two themed instances w/ dynamic props w/ same theme = 3 styles, different theme update = 4 styles', () => {
    const registry = new SheetsRegistry()
    const renderer = TestRenderer.create(
      <JssProvider registry={registry}>
        <ThemeProvider theme={ThemeA}>
          <ThemedDynamicComponent backgroundColor="#fff" />
        </ThemeProvider>
        <ThemeProvider theme={ThemeA}>
          <ThemedDynamicComponent backgroundColor="#fff" />
        </ThemeProvider>
      </JssProvider>
    )

    expect(registry.registry.length).to.equal(1)

    renderer.update(
      <JssProvider registry={registry}>
        <ThemeProvider theme={ThemeA}>
          <ThemedDynamicComponent backgroundColor="#fff" />
        </ThemeProvider>
        <ThemeProvider theme={ThemeB}>
          <ThemedDynamicComponent backgroundColor="#fff" />
        </ThemeProvider>
      </JssProvider>
    )

    expect(registry.registry.length).to.equal(2)
  })

  it('two themed instances wo/ dynamic props w/ different themes = 2 styles, same theme update = 1 style', () => {
    const registry = new SheetsRegistry()
    const renderer = TestRenderer.create(
      <JssProvider registry={registry}>
        <ThemeProvider theme={ThemeA}>
          <ThemedStaticComponent />
        </ThemeProvider>
        <ThemeProvider theme={ThemeB}>
          <ThemedStaticComponent />
        </ThemeProvider>
      </JssProvider>
    )

    expect(registry.registry.length).to.equal(2)

    renderer.update(
      <JssProvider registry={registry}>
        <ThemeProvider theme={ThemeA}>
          <ThemedStaticComponent />
        </ThemeProvider>
        <ThemeProvider theme={ThemeA}>
          <ThemedStaticComponent />
        </ThemeProvider>
      </JssProvider>
    )

    expect(registry.registry[1].attached).to.equal(false)
    expect(registry.registry.length).to.equal(2)
  })

  it('two themed instances w/ dynamic props w/ different themes = 4 styles, same theme update = 3 styles', () => {
    const registry = new SheetsRegistry()
    const renderer = TestRenderer.create(
      <JssProvider registry={registry}>
        <ThemeProvider theme={ThemeA}>
          <ThemedDynamicComponent backgroundColor="#fff" />
        </ThemeProvider>
        <ThemeProvider theme={ThemeB}>
          <ThemedDynamicComponent backgroundColor="#fff" />
        </ThemeProvider>
      </JssProvider>
    )

    expect(registry.registry.length).to.equal(2)

    renderer.update(
      <JssProvider registry={registry}>
        <ThemeProvider theme={ThemeA}>
          <ThemedDynamicComponent backgroundColor="#fff" />
        </ThemeProvider>
        <ThemeProvider theme={ThemeA}>
          <ThemedDynamicComponent backgroundColor="#fff" />
        </ThemeProvider>
      </JssProvider>
    )

    expect(registry.registry[1].attached).to.equal(false)
    expect(registry.registry.length).to.equal(2)
  })

  describe('when theming object returned from createTheming is provided to injectSheet options', () => {
    it('allows nested ThemeProviders with custom namespace', () => {
      const themingA = createTheming(React.createContext())
      const themingB = createTheming(React.createContext())
      const {ThemeProvider: ThemeProviderA} = themingA
      const {ThemeProvider: ThemeProviderB} = themingB

      let colorReceivedInStyleA
      let colorReceivedInStyleB
      let themeReceivedInComponentA
      let themeReceivedInComponentB

      const styleA = theme => {
        colorReceivedInStyleA = theme.color
      }
      const styleB = theme => {
        colorReceivedInStyleB = theme.color
      }

      const ComponentA = createStyledComponent(styleA, {theming: themingA, injectTheme: true})
      ComponentA.defaultProps = {
        getTheme: theme => {
          themeReceivedInComponentA = theme
        }
      }
      const ComponentB = createStyledComponent(styleB, {theming: themingB, injectTheme: true})
      ComponentB.defaultProps = {
        getTheme: theme => {
          themeReceivedInComponentB = theme
        }
      }

      TestRenderer.create(
        <ThemeProviderA theme={ThemeA}>
          <ThemeProviderB theme={ThemeB}>
            <div>
              <ComponentA />
              <ComponentB />
            </div>
          </ThemeProviderB>
        </ThemeProviderA>
      )

      expect(themeReceivedInComponentA).to.eql(ThemeA)
      expect(themeReceivedInComponentB).to.eql(ThemeB)
      expect(colorReceivedInStyleA).to.eql(ThemeA.color)
      expect(colorReceivedInStyleB).to.eql(ThemeB.color)
    })
  })
}
