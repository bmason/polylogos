import Navbar from './navbar'


export default function Layout({state, children }) {
  return (
    <>
      <Navbar state={state} >
      <main>{children}</main>
    </Navbar>
    </>
  )
}