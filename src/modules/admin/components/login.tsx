import { Box, Button, Text } from '@adminjs/design-system'
import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  html, body, #app {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
`

const Wrapper = styled(Box)`
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
`

const Login: React.FC<{}> = () => {
  return (
    <div>
      <GlobalStyle />
      <Wrapper flex variant="grey">
        <Box bg="white" flex boxShadow="login" width={[1, 2 / 3, 'auto']}>
          <Box p="100px" flexGrow={1} action="login" method="POST" as="form">
            <Text textAlign="center">
              <Button variant="primary" type="submit">
                Just let me in!
              </Button>
            </Text>
          </Box>
        </Box>
      </Wrapper>
    </div>
  )
}

export default Login
