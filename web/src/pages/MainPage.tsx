import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import apiClient from "../api/apiClient";

function MainPage() {
  const { auth } = useAuth();
  const [user, setUser] = useState();
  console.log(auth.accessToken);

  useEffect(() => {
    (async () => {
      const res = await apiClient.get("/users/me", {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
      console.log(res, res.data);
    })();
  }, [auth]);
  return (
    <>
      <h1>Main page xd</h1>
      <h2>{user}</h2>
    </>
  );
}
export default MainPage;
