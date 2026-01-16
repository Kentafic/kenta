import NavBar from "../components/navBar/NavBar";
import RegisterForm from "../components/Register/RegisterForm";

export default function Register() {
  return (
    <>
      <NavBar />
      <RegisterForm />
    </>
  );
}

Register.getLayout = function getLayout(page) {
  return <>{page}</>;
};
