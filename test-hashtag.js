// Test hashtag detection
const testText = `Explaining calorie deficit like you are a 5y^o.
But first let me explain how we gain body fat; Everyday our body needs a certain amount of calories to function and this number varies per person. Let's assume that an individual needs 2000cal, now if that person eat the exact 2000cal that he needs his body is going to use everything up, there'll be no change. Which means that you wont gain fat and you wont lose fat either you still stay the same. Now let's assume that one day you ate 2200cal, now you have more than what your body needs(200cal extra). Your body is going to convert the 200cal extra into fat and store it. Day rolls by and today you have done 2300cal, you already know now??? <.> lol, it will store the 300cal extra as fat since your body only needs 2000cal. For everyday that you eat more than 2000cal your body is going to store the excess as fat. HOW DO YOU REDUCE THE FAT? Remember your body needs 2000cal everyday, but what if you give it less? (1500cal). What you have basically done is that you have created a 500cal deficit. Now you body is thinking hmmm... how do i get the missing 500cal from because it needs it. Then it finally remembers that it has been storing excess calories as fat all this while. So all it has to do is to burn down enough fat to provide the 500cal that is missing and then add it to the 1500cal that you ate (2000cal). The next day you eat 1500cal again, your body do the same to make it up . THAT IS HOW we lose weight/excess fat. Please don't forget to drink lots of water.

#health #fatLoss #LULU`;

// Test the regex pattern
const parts = testText.split(/(@[a-zA-Z0-9_]+|#[a-zA-Z0-9_]+)/g);

console.log('Detected hashtags and mentions:');
parts.forEach((part, index) => {
  if (part.startsWith('#')) {
    console.log(`Found hashtag: ${part}`);
  } else if (part.startsWith('@')) {
    console.log(`Found mention: ${part}`);
  }
});

console.log('\nAll parts:');
console.log(parts);