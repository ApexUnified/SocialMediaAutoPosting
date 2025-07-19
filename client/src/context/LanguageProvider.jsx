import { useEffect, useState } from "react";
import { LanguageContext } from "./LanguageContext";

const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const storedLang = localStorage.getItem("lang");
    if (storedLang) {
      setLang(storedLang);
    } else {
      localStorage.setItem("lang", "en");
    }
  }, []);

  const switchLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
