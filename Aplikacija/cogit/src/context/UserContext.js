import React, { useState, createContext } from "react";

export const UserContext = createContext();

export const UserProvider = (props) => {
  const [userInfo, setUserInfo] = useState({
    id: "",
    admin: false,
    token: "",
    email: "",
    username: "",
    notificationNumber: 0,
    avatar: "Placeholder",
    avatarSrc:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAACQklEQVR4nO2dSa6DMBAFuf/ZOIOXXnOD+osvMjLYbg9NeCUhRRlwvxIJBGwzzfNMCIEYo5aMJYTAPM9M64NlWRBpLMvCuuFNMcbHE5J4zqurGOO/wM8XxDafjt4Ebr1BPNly8yVw7413Z8/JpsCjD9yRIxe7As8+eBfOHBwKTFnBL5OS/VRg6op+jdTMSQJzVvgL5GRNFpi74quSmzFLYEkDV6IkW7bA0oa8U5qpSKClQY9YshQLtDbsBWsGk8AaBYykRu1mgbUK6U2tmqsIrFlQD2rWWk0gXENi7RqrCgTfElvUVl0g+JTYqqYmAsGXxJa1NBMIPiS2rqGpQBgrsUfbzQXCGIm92uwiEPpK7NlWN4HQJ1jvrb2rQGgbcMRPRXeB0CboqJ3VEIFQN/DIPf0wgVAn+OhjzaECwSZgtDxwIBDKRHiQB04EQp4QL/LAkUBIE+NJHjgTCMeCvMkDhwJhW5RHeeBUILwL8yoPHAuEp0Sv8kACzbgVqK+wAe1EDOgwxoAOpA3or5wBnUwwoNNZBnRC1YBO6RvQRSUDuqxpQBfWDahrhwF1LjKg7m0GRh+j9ahBXXyNqJO5EQ1zMKKBNkY01MuIBhsaa9Zw15HDXa8sb8WaQUP+GTDk/5fkrZRm0rQnL5Rk08Q7H+Rm1NRPG+Rk1eRjO6Rm1vR3B6RkPxR4Z3krZw52BUrekyMXmwIl75s9J18CJW+fLTdvAiXvnE9HD4GSl86rqxijbkZQwioxhMC0Pohx/C0mrrSsG94fs32wh1p7Jm0AAAAASUVORK5CYII=",
  });

  return (
    <UserContext.Provider value={[userInfo, setUserInfo]}>
      {props.children}
    </UserContext.Provider>
  );
};
