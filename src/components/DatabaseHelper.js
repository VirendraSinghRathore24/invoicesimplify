import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    updateDoc,
  } from "firebase/firestore";
  import { db } from "../config/firebase";
  
  // get pdf data
  const getPdfCount = async (loggedInUser) => {
    const pdfCollectionRef = collection(db, "Invoice_PdfCount");
  
    const data = await getDocs(pdfCollectionRef);
    const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  
    const count = filteredData.filter((x) => x.loggedInUser === loggedInUser)[0];
    return count;
  };
  
  // add pdf data
  const inv_pdfCount_CollectionRef = collection(db, "Invoice_PdfCount");
  const addPdfCount = async (loggedInUser) => {
    const d = new Date();
    const currentDate =
      d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
  
    await addDoc(inv_pdfCount_CollectionRef, {
      loggedInUser: loggedInUser,
      pdfCount: 3,
      plan: "trial",
      date: currentDate,
    });
  };
  
  // update pdf data
  const updatePdfCount = async (pdf) => {
    try {
      const codeDoc = doc(db, "Invoice_PdfCount", pdf.id);
      await updateDoc(codeDoc, {
        pdfCount: pdf.pdfCount - 1,
      });
    } catch (er) {
      console.log(er);
    }
  };
  
  const updatePdfPlan = async (pdf, plan, count) => {
    try {
      const codeDoc = doc(db, "Invoice_PdfCount", pdf.id);
      const d = new Date();
      const currentDate =
        d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
      await updateDoc(codeDoc, {
        plan: plan,
        pdfCount: count,
        date: currentDate,
      });
    } catch (er) {
      console.log(er);
    }
  };
  
  const inv_BrandInfo_CollectionRef = collection(db, "Invoice_BrandInfo");
  const addBrandInfo = async (loggedInUser, name, address, amount) => {
    try {
      const d = new Date();
      const currentDate =
        d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
  
      await addDoc(inv_BrandInfo_CollectionRef, {
        loggedInUser: loggedInUser,
        date: currentDate,
        name: name,
        address: address,
        amount: amount,
      });
    } catch (err) {
      console.log(err);
    }
  };
  
  const inv_BrandFullInfo_CollectionRef = collection(db, "Invoice_BrandFullInfo");
  const addBrandFullInfo = async (loggedInUser, invoiceToInfo) => {
    try {
      await addDoc(inv_BrandFullInfo_CollectionRef, {
        loggedInUser: loggedInUser,
  
        invoiceToInfo: invoiceToInfo,
      });
    } catch (err) {
      console.log(err);
    }
  };
  
  const getInvoiceToInfo = async (loggedInUser) => {
    const data = await getDocs(inv_BrandFullInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  
    const allBrandsInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    );
    return allBrandsInfo;
  };
  
  const handleDeleteBrandInfo = async (id) => {
    var res = window.confirm("Delete the item?");
    if (res) {
      const invDoc = doc(db, "Invoice_BrandInfo", id);
      await deleteDoc(invDoc);
    } else {
      // Do nothing!
      console.log("Not deleted");
    }
  };
  const inv_PersonalData_CollectionRef = collection(db, "Invoice_PersonalData");
  const getPersonalData = async (loggedInUser) => {
    const data = await getDocs(inv_PersonalData_CollectionRef);
    const personalData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
  
    return personalData.filter((x) => x.loggedInUser === loggedInUser);
  };
  
  const updatePersonalData = async (id, personalInfo) => {
    try {
      const codeDoc = doc(db, "Invoice_PersonalData", id);
      await updateDoc(codeDoc, {
        personalInfo: personalInfo,
      });
    } catch (er) {
      console.log(er);
    }
  };
  
  // const updatePersonalData = async (pdf, plan, count) => {
  //   try {
  //     const codeDoc = doc(db, "Invoice_PersonalData", pdf.id);
  //     const d = new Date();
  //     const currentDate =
  //       d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
  //     await updateDoc(codeDoc, {
  //       plan: plan,
  //       pdfCount: count,
  //       date: currentDate,
  //     });
  //   } catch (er) {
  //     console.log(er);
  //   }
  // };
  
  const addPersonalData = async (loggedInUser, personalInfo) => {
    await addDoc(inv_PersonalData_CollectionRef, {
      personalInfo: personalInfo,
      loggedInUser: loggedInUser,
    });
  };
  
  const inv_AccountData_CollectionRef = collection(db, "Invoice_AccountData");
  const getAccountData = async (loggedInUser) => {
    const data = await getDocs(inv_AccountData_CollectionRef);
    const accountData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    return accountData.filter((x) => x.loggedInUser === loggedInUser);
  };
  
  const addAccountData = async (loggedInUser, accountInfo) => {
    await addDoc(inv_AccountData_CollectionRef, {
      accountInfo: accountInfo,
      loggedInUser: loggedInUser,
    });
  };
  
  const updateAccountData = async (id, accountInfo) => {
    try {
      const codeDoc = doc(db, "Invoice_AccountData", id);
      await updateDoc(codeDoc, {
        accountInfo: accountInfo,
      });
    } catch (er) {
      console.log(er);
    }
  };
  
  const inv_InvoiceToData_CollectionRef = collection(db, "Invoice_InvoiceToData");
  const addInvoiceToData = async (loggedInUser, invoiceToInfo) => {
    await addDoc(inv_InvoiceToData_CollectionRef, {
      invoiceToInfo: invoiceToInfo,
      loggedInUser: loggedInUser,
    });
  };
  
  const getInvoiceToData = async (loggedInUser) => {
    const data = await getDocs(inv_InvoiceToData_CollectionRef);
    const invoiceToData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    return invoiceToData.filter((x) => x.loggedInUser === loggedInUser);
  };
  
  const updateInvoiceToData = async (id, invoiceToInfo) => {
    try {
      const codeDoc = doc(db, "Invoice_InvoiceToData", id);
      await updateDoc(codeDoc, {
        invoiceToInfo: invoiceToInfo,
      });
    } catch (er) {
      console.log(er);
    }
  };
  
  const deleteInvoiceToData = async (id) => {
      var res = window.confirm("Delete the item?");
    if (res) {
      const invDoc = doc(db, "Invoice_InvoiceToData", id);
      await deleteDoc(invDoc);
    } else {
      // Do nothing!
      console.log("Not deleted");
    }
  }
  
  const userSettings_CollectionRef = collection(db, "User_Settings");
  const getUserSettings = async (loggedInUser) => {
    const data = await getDocs(userSettings_CollectionRef);
    const accountData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  
    if(accountData.length === 0) return null;
  
    return accountData.filter((x) => x.loggedInUser === loggedInUser);
  };
  
  const addUserSettings = async (loggedInUser, userSettingInfo) => {
    await addDoc(userSettings_CollectionRef, {
      userSettingInfo: userSettingInfo,
      loggedInUser: loggedInUser,
    });
  };
  
  const updateUserSettings = async (id, userSettingInfo) => {
    try {
      const codeDoc = doc(db, "User_Settings", id);
      await updateDoc(codeDoc, {
        userSettingInfo: userSettingInfo,
      });
    } catch (er) {
      console.log(er);
    }
  };
  
  const deleteUserSettings = async () => {
    let docId = '';
    const data = await getDocs(userSettings_CollectionRef);
    data.docs.map((doc) => ({ ...doc.data(), docId: doc.id }));
    db.collection("User_Settings").doc(docId).delete();
  }
  
  
  const inv_PdfData_CollectionRef = collection(db, "Invoice_PdfData");
  const addPdfData = async (
    loggedInUser,
    personalInfo,
    accountInfo,
    invoiceToInfo,
    invoiceInfo,
    invoiceName,
    rows,
    amount,
    symbol,
    currency,
    signedDate,
    imageUrl
  ) => {
    await addDoc(inv_PdfData_CollectionRef, {
      personalInfo: personalInfo,
      accountInfo: accountInfo,
      invoiceToInfo: invoiceToInfo,
      invoiceInfo: invoiceInfo,
      invoiceName: invoiceName,
      rows: rows,
      amount: amount,
      loggedInUser: loggedInUser,
      symbol:symbol,
      currency:currency,
      signedDate:signedDate,
      imageUrl :imageUrl
    });
  };
  
  const getPdfInfo = async (loggedInUser) => {
      const data = await getDocs(inv_PdfData_CollectionRef);
      const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    
      const allBrandsInfo = filteredData.filter(
        (x) => x.loggedInUser === loggedInUser
      );
      return allBrandsInfo;
    };
  
    const deletePdfData = async (id) => {
      var res = window.confirm("Delete the item?");
    if (res) {
      const invDoc = doc(db, "Invoice_PdfData", id);
      await deleteDoc(invDoc);
    } else {
      // Do nothing!
      console.log("Not deleted");
    }
  }
  
  const deletePersonalData = async (id) => {
      var res = window.confirm("Delete the item?");
    if (res) {
      const invDoc = doc(db, "Invoice_PersonalData", id);
      await deleteDoc(invDoc);
    } else {
      // Do nothing!
      console.log("Not deleted");
    }
  }
  
  const deleteAccountData = async (id) => {
      var res = window.confirm("Delete the item?");
    if (res) {
      const invDoc = doc(db, "Invoice_AccountData", id);
      await deleteDoc(invDoc);
    } else {
      // Do nothing!
      console.log("Not deleted");
    }
  }
  
  const inv_InvoiceNumber_CollectionRef = collection(db, "Invoice_InvoiceNumber");
  
  const getInvoiceNumber = async (loggedInUser) => {
  
    const data = await getDocs(inv_InvoiceNumber_CollectionRef);
    const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  
    const invoiceData = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    )[0];
  
    let newInvoiceNumber = 30;
    if(invoiceData === undefined || invoiceData.length === 0){
      await addInvoiceNumber(loggedInUser, newInvoiceNumber);
    }else {
      // update invoice number
      newInvoiceNumber = invoiceData.invoiceNumber + 1;
      await updateInvoiceNumber(invoiceData, newInvoiceNumber)
    }
  
    return newInvoiceNumber;
  }
  
  const addInvoiceNumber = async (loggedInUser, invoiceNumber) => {
  await addDoc(inv_InvoiceNumber_CollectionRef, {
      invoiceNumber: invoiceNumber,
      loggedInUser: loggedInUser,
    });
  }
  
  const updateInvoiceNumber = async (invoiceData, invoiceNumber) => {
    try {
      const codeDoc = doc(db, "Invoice_InvoiceNumber", invoiceData.id);
      await updateDoc(codeDoc, {
        invoiceNumber: invoiceNumber,
      });
    } catch (er) {
      console.log(er);
    }
  };
  
  const contactInfoRef = collection(db, "Invoice_Contacts");
  const addContactInfo = async (contact) => {
    await addDoc(contactInfoRef, {
        contact: contact
      });
    }
  
  export {
    getPdfCount,
    addPdfCount,
    updatePdfCount,
    updatePdfPlan,
    addBrandInfo,
    getPdfInfo,
    handleDeleteBrandInfo,
    addBrandFullInfo,
    getInvoiceToInfo,
    getPersonalData,
    addPersonalData,
    updatePersonalData,
    getAccountData,
    addAccountData,
    updateAccountData,
    addInvoiceToData,
    updateInvoiceToData,
    addPdfData,
    deletePersonalData,
    deleteAccountData,
    deletePdfData,
    deleteInvoiceToData,
    getInvoiceToData,
    getInvoiceNumber,
    addContactInfo,
    getUserSettings,
    addUserSettings,
    updateUserSettings,
    deleteUserSettings
  };
  