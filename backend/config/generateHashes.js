import bcrypt from "bcryptjs";

const password = "Password@123"; // common initial password

const users = ["operator", "cse_hod", "eee_hod", "ece_hod", "mech_hod", "civil_hod"];

for (const user of users) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${user}: ${hash}`);
}
