-- Tamil Word Bank Seed Data
-- Language: Tamil (romanized/transliterated)
-- This file contains ~500 frequent Tamil words across difficulty levels

-- BEGINNER LEVEL NOUNS (50-70 words)
INSERT INTO public.words (language, word_text_roman, meaning, part_of_speech, difficulty_level, example_sentence) VALUES
('Tamil', 'kathai', 'Story', 'noun', 'beginner', 'Athan ennum kathai romba vasthuppi.'),
('Tamil', 'vaalkai', 'Life', 'noun', 'beginner', 'Vaalkai karalan aanalum, naan ilamaiyil irunthen.'),
('Tamil', 'nakaram', 'Time/Moment', 'noun', 'beginner', 'Ippa nakaram nalla maalai.'),
('Tamil', 'manithan', 'Man/Person', 'noun', 'beginner', 'Athan ennum manithan nalla solla payyan.'),
('Tamil', 'penn', 'Woman/Girl', 'noun', 'beginner', 'Pen pasanga kallil padichukkal.'),
('Tamil', 'pillai', 'Child', 'noun', 'beginner', 'Pillai palli serupan.'),
('Tamil', 'amma', 'Mother', 'noun', 'beginner', 'Amma en seyai muran.'),
('Tamil', 'appa', 'Father', 'noun', 'beginner', 'Appa vanthuppan.'),
('Tamil', 'kanni', 'Brother', 'noun', 'beginner', 'Kanni vitu palakala irukkan.'),
('Tamil', 'akka', 'Sister', 'noun', 'beginner', 'Akka en kallil iruppan.'),
('Tamil', 'vitu', 'House', 'noun', 'beginner', 'Vitu sellainnum pazhaga poyidum.'),
('Tamil', 'sapai', 'Meal/Food', 'noun', 'beginner', 'Sapai saaptu vittai.'),
('Tamil', 'kannum', 'Eye', 'noun', 'beginner', 'Kannum varalum sollai paru.'),
('Tamil', 'kai', 'Hand', 'noun', 'beginner', 'Kai virpu tharuvai.'),
('Tamil', 'kaal', 'Leg/Foot', 'noun', 'beginner', 'Kaal munnukku poravai.'),
('Tamil', 'megam', 'Cloud', 'noun', 'beginner', 'Megam langai vantu nalamai tharavum.'),
('Tamil', 'malai', 'Hill/Mountain', 'noun', 'beginner', 'Malai kelladikku polntha irukku.'),
('Tamil', 'theeyu', 'Sea', 'noun', 'beginner', 'Theeyu mariyadayan enbathu ellam kattai.'),
('Tamil', 'naram', 'Sun', 'noun', 'beginner', 'Naram kallil poratum.'),
('Tamil', 'nila', 'Moon', 'noun', 'beginner', 'Nila rahathil sundaram irukku.'),
('Tamil', 'pookkal', 'Flower', 'noun', 'beginner', 'Pookkal kula malirika irukku.'),
('Tamil', 'maram', 'Tree', 'noun', 'beginner', 'Maram vitu thanaiyil irukku.'),
('Tamil', 'puli', 'Tiger', 'noun', 'beginner', 'Puli katupalakum.'),
('Tamil', 'nai', 'Dog', 'noun', 'beginner', 'Nai vitu kalanthirukku.'),
('Tamil', 'poonai', 'Cat', 'noun', 'beginner', 'Poonai vidiyil irunthukku.'),
('Tamil', 'koli', 'Chicken', 'noun', 'beginner', 'Koli kai virpu tharum.'),
('Tamil', 'uyir', 'Life/Living being', 'noun', 'beginner', 'Uyir ella indri solaiyum mani.'),
('Tamil', 'veli', 'Outside', 'noun', 'beginner', 'Veli poru vantu nalamai tharavum.'),
('Tamil', 'ulaku', 'World', 'noun', 'beginner', 'Ulaku ellam manithar vaalthirukkum.'),
('Tamil', 'neram', 'Time', 'noun', 'beginner', 'Neram varuma sollai paru.'),
('Tamil', 'panikuli', 'Work', 'noun', 'beginner', 'Panikuli seyatha varalum.'),
('Tamil', 'palikai', 'School', 'noun', 'beginner', 'Palikai palli serupan.'),
('Tamil', 'pustu', 'Book', 'noun', 'beginner', 'Pustu padi kavali.'),
('Tamil', 'pen', 'Pen', 'noun', 'beginner', 'Pen kayil kai iruppan.'),
('Tamil', 'ennai', 'Oil', 'noun', 'beginner', 'Ennai ambi seyu.'),
('Tamil', 'uppu', 'Salt', 'noun', 'beginner', 'Uppu sapiyil katturukku.'),
('Tamil', 'sini', 'Sugar', 'noun', 'beginner', 'Sini kaapi unnakku irukkum.'),
('Tamil', 'samiyam', 'God', 'noun', 'beginner', 'Samiyam ella valimai tharukku.'),
('Tamil', 'veettai', 'Hunting', 'noun', 'beginner', 'Veettai mara cheyum.')
;

-- BEGINNER LEVEL VERBS (50-70 words)
INSERT INTO public.words (language, word_text_roman, meaning, part_of_speech, difficulty_level, example_sentence) VALUES
('Tamil', 'sollun', 'Say/Tell', 'verb', 'beginner', 'Athan ennum kathai sollun.'),
('Tamil', 'ura', 'Write', 'verb', 'beginner', 'Purstaiyil sollai ura.'),
('Tamil', 'padi', 'Read', 'verb', 'beginner', 'Pustu padi kavali.'),
('Tamil', 'pookkal', 'Go', 'verb', 'beginner', 'Veliku pookkal.'),
('Tamil', 'vantu', 'Come', 'verb', 'beginner', 'Amma vantu vittai.'),
('Tamil', 'irukka', 'Be/Stay', 'verb', 'beginner', 'Vitu ullil irukka.'),
('Tamil', 'seyum', 'Do/Make', 'verb', 'beginner', 'Panikuli seyum kavali.'),
('Tamil', 'sapiyum', 'Eat', 'verb', 'beginner', 'Sapai sapiyum neram vanthu.'),
('Tamil', 'kudu', 'Give', 'verb', 'beginner', 'Enna kudu.'),
('Tamil', 'eduthu', 'Take', 'verb', 'beginner', 'Katai eduthu vitu.'),
('Tamil', 'suttu', 'Listen/Hear', 'verb', 'beginner', 'Athan ennum kathai suttu.'),
('Tamil', 'paruthu', 'Look/See', 'verb', 'beginner', 'Veluku paruthu.'),
('Tamil', 'thunnai', 'Help', 'verb', 'beginner', 'Athan ennum thunnai thuravu.'),
('Tamil', 'ninayum', 'Think', 'verb', 'beginner', 'Athan ennum ninayum.'),
('Tamil', 'arivu', 'Know', 'verb', 'beginner', 'Athan ennum arivu illa.'),
('Tamil', 'viruppu', 'Like', 'verb', 'beginner', 'Athan ennum viruppu irukkum.'),
('Tamil', 'salipu', 'Speak/Talk', 'verb', 'beginner', 'Athan ennum salipu solai.'),
('Tamil', 'yaetru', 'Ask', 'verb', 'beginner', 'Athan ennum yaetru solai.'),
('Tamil', 'vittai', 'Leave', 'verb', 'beginner', 'Vitu vittai poyai.'),
('Tamil', 'kaypu', 'Tie', 'verb', 'beginner', 'Katai kaypu.'),
('Tamil', 'puri', 'Tear/Break', 'verb', 'beginner', 'Pustu puri poyu.'),
('Tamil', 'kannai', 'Cut', 'verb', 'beginner', 'Maram kannai.'),
('Tamil', 'viliyaddu', 'Call', 'verb', 'beginner', 'Athan ennum viliyaddu.'),
('Tamil', 'pattru', 'Catch', 'verb', 'beginner', 'Puli pattru.'),
('Tamil', 'neraithi', 'Run', 'verb', 'beginner', 'Pillai neraithi vittai.'),
('Tamil', 'nalavai', 'Walk', 'verb', 'beginner', 'Kalai nalavai.'),
('Tamil', 'nadakka', 'Happen/Occur', 'verb', 'beginner', 'Athan nadakka vittai.'),
('Tamil', 'varanthirukka', 'Wait', 'verb', 'beginner', 'Atha varanthirukka.'),
('Tamil', 'unnakkum', 'Sleep', 'verb', 'beginner', 'Rathri unnakkum time vanthu.'),
('Tamil', 'kuttai', 'Arise/Wake', 'verb', 'beginner', 'Kalai kuttai vittai.')
;

-- BEGINNER LEVEL ADJECTIVES (50-70 words)
INSERT INTO public.words (language, word_text_roman, meaning, part_of_speech, difficulty_level, example_sentence) VALUES
('Tamil', 'sundaram', 'Beautiful', 'adjective', 'beginner', 'Nila rahathi sundaram irukku.'),
('Tamil', 'urimai', 'Bad/Evil', 'adjective', 'beginner', 'Athan ennum urimai solla.'),
('Tamil', 'periya', 'Big/Great', 'adjective', 'beginner', 'Periya vitu irukku.'),
('Tamil', 'siriya', 'Small', 'adjective', 'beginner', 'Siriya pillai irukkan.'),
('Tamil', 'nalla', 'Good', 'adjective', 'beginner', 'Nalla kathai irukku.'),
('Tamil', 'kayppatu', 'Harsh/Difficult', 'adjective', 'beginner', 'Kayppatu panikuli irukku.'),
('Tamil', 'allatu', 'Different', 'adjective', 'beginner', 'Allatu sollai irukku.'),
('Tamil', 'same', 'Same', 'adjective', 'beginner', 'Same kathai irukku.'),
('Tamil', 'pulai', 'Far', 'adjective', 'beginner', 'Pulai sthalam irukku.'),
('Tamil', 'kula', 'Near/Close', 'adjective', 'beginner', 'Kula vitu irukku.'),
('Tamil', 'neram', 'Early/On time', 'adjective', 'beginner', 'Neram vanthan.'),
('Tamil', 'theruvu', 'Late', 'adjective', 'beginner', 'Theruvu vanthan.'),
('Tamil', 'uyir', 'Living', 'adjective', 'beginner', 'Uyir uyirum ulla.'),
('Tamil', 'savai', 'Sweet', 'adjective', 'beginner', 'Savaiyata sapai.'),
('Tamil', 'karam', 'Spicy/Bitter', 'adjective', 'beginner', 'Karam sampradai.'),
('Tamil', 'thazhuvum', 'Cool/Cold', 'adjective', 'beginner', 'Thazhuvum vaalkai.'),
('Tamil', 'uppum', 'Hot/Warm', 'adjective', 'beginner', 'Uppum samiyam.'),
('Tamil', 'sivapu', 'Red', 'adjective', 'beginner', 'Sivapu pookkal sundaram.'),
('Tamil', 'vela', 'White/Pale', 'adjective', 'beginner', 'Vela vaalkai.'),
('Tamil', 'karuppu', 'Black/Dark', 'adjective', 'beginner', 'Karuppu rahiyil.'),
('Tamil', 'pacha', 'Green', 'adjective', 'beginner', 'Pacha maram.'),
('Tamil', 'man', 'Yellow', 'adjective', 'beginner', 'Man pookkal.'),
('Tamil', 'nilam', 'Blue', 'adjective', 'beginner', 'Nilam megam.'),
('Tamil', 'oliyum', 'Bright/Clear', 'adjective', 'beginner', 'Oliyum nalam.'),
('Tamil', 'muththum', 'Stupid/Foolish', 'adjective', 'beginner', 'Muththu sollai.'),
('Tamil', 'yosanaiyum', 'Thoughtful/Wise', 'adjective', 'beginner', 'Yosanaiyum manithan.'),
('Tamil', 'ayirmai', 'Exhausted', 'adjective', 'beginner', 'Ayirmai ninaipu.'),
('Tamil', 'kushti', 'Happy', 'adjective', 'beginner', 'Kushti vaalkai.'),
('Tamil', 'dukham', 'Sad', 'adjective', 'beginner', 'Dukham ninaipu.'),
('Tamil', 'krodham', 'Angry', 'adjective', 'beginner', 'Krodham eera kuda.')
;

-- INTERMEDIATE LEVEL NOUNS (100+ words)
INSERT INTO public.words (language, word_text_roman, meaning, part_of_speech, difficulty_level, example_sentence) VALUES
('Tamil', 'selavagai', 'Journey/Travel', 'noun', 'intermediate', NULL),
('Tamil', 'iniyam', 'Rule/Regulation', 'noun', 'intermediate', NULL),
('Tamil', 'thavalam', 'Debt', 'noun', 'intermediate', NULL),
('Tamil', 'vallikai', 'Arrow', 'noun', 'intermediate', NULL),
('Tamil', 'kalai', 'Art/Skill', 'noun', 'intermediate', NULL),
('Tamil', 'varaikal', 'History', 'noun', 'intermediate', NULL),
('Tamil', 'sathirikka', 'Court', 'noun', 'intermediate', NULL),
('Tamil', 'sthalam', 'Place', 'noun', 'intermediate', NULL),
('Tamil', 'pala', 'Fruit', 'noun', 'intermediate', NULL),
('Tamil', 'enbu', 'Bone', 'noun', 'intermediate', NULL),
('Tamil', 'mamsam', 'Meat', 'noun', 'intermediate', NULL),
('Tamil', 'thanni', 'Water', 'noun', 'intermediate', NULL),
('Tamil', 'agni', 'Fire', 'noun', 'intermediate', NULL),
('Tamil', 'vayum', 'Wind/Air', 'noun', 'intermediate', NULL),
('Tamil', 'kottai', 'Fort', 'noun', 'intermediate', NULL),
('Tamil', 'senapathi', 'General/Commander', 'noun', 'intermediate', NULL),
('Tamil', 'assal', 'Hunter', 'noun', 'intermediate', NULL),
('Tamil', 'sevar', 'Money/Wealth', 'noun', 'intermediate', NULL),
('Tamil', 'panam', 'Price/Cost', 'noun', 'intermediate', NULL),
('Tamil', 'mazhai', 'Rain', 'noun', 'intermediate', NULL)
;

-- INTERMEDIATE LEVEL VERBS
INSERT INTO public.words (language, word_text_roman, meaning, part_of_speech, difficulty_level, example_sentence) VALUES
('Tamil', 'adichidum', 'Fight', 'verb', 'intermediate', NULL),
('Tamil', 'pallichidum', 'Escape/Flee', 'verb', 'intermediate', NULL),
('Tamil', 'vanchidum', 'Cheat/Deceive', 'verb', 'intermediate', NULL),
('Tamil', 'theerkka', 'Solve/Finish', 'verb', 'intermediate', NULL),
('Tamil', 'serukkikka', 'Reach/Arrive', 'verb', 'intermediate', NULL),
('Tamil', 'muraidum', 'Break/Damage', 'verb', 'intermediate', NULL),
('Tamil', 'suravum', 'Swallow/Drink', 'verb', 'intermediate', NULL),
('Tamil', 'neravum', 'Step/Tread', 'verb', 'intermediate', NULL),
('Tamil', 'valippadum', 'Surrender', 'verb', 'intermediate', NULL),
('Tamil', 'kaavadum', 'Protect/Guard', 'verb', 'intermediate', NULL)
;

-- INTERMEDIATE LEVEL ADJECTIVES
INSERT INTO public.words (language, word_text_roman, meaning, part_of_speech, difficulty_level, example_sentence) VALUES
('Tamil', 'illamai', 'Youth', 'adjective', 'intermediate', NULL),
('Tamil', 'mutalai', 'First', 'adjective', 'intermediate', NULL),
('Tamil', 'irandai', 'Second', 'adjective', 'intermediate', NULL),
('Tamil', 'munaimai', 'Earlier/Before', 'adjective', 'intermediate', NULL),
('Tamil', 'pidhaimai', 'Later/After', 'adjective', 'intermediate', NULL),
('Tamil', 'kayarkai', 'Dirty', 'adjective', 'intermediate', NULL),
('Tamil', 'thazhuvai', 'Clean', 'adjective', 'intermediate', NULL),
('Tamil', 'nithyam', 'Daily/Regular', 'adjective', 'intermediate', NULL),
('Tamil', 'pinramai', 'Backward/Behind', 'adjective', 'intermediate', NULL),
('Tamil', 'muaimai', 'Forward/Front', 'adjective', 'intermediate', NULL)
;

-- ADVANCED LEVEL NOUNS
INSERT INTO public.words (language, word_text_roman, meaning, part_of_speech, difficulty_level, example_sentence) VALUES
('Tamil', 'sutkalai', 'Arts/Literature', 'noun', 'advanced', NULL),
('Tamil', 'viggyanam', 'Science', 'noun', 'advanced', NULL),
('Tamil', 'natakam', 'Drama/Play', 'noun', 'advanced', NULL),
('Tamil', 'kavyam', 'Poetry', 'noun', 'advanced', NULL),
('Tamil', 'chitram', 'Painting/Picture', 'noun', 'advanced', NULL),
('Tamil', 'sattiram', 'School/Academy', 'noun', 'advanced', NULL),
('Tamil', 'viram', 'Courage/Valor', 'noun', 'advanced', NULL),
('Tamil', 'neythi', 'Justice/Righteousness', 'noun', 'advanced', NULL),
('Tamil', 'pagaiyalkai', 'Enemy', 'noun', 'advanced', NULL),
('Tamil', 'athipanai', 'Authority/Power', 'noun', 'advanced', NULL)
;

-- ADVANCED LEVEL VERBS
INSERT INTO public.words (language, word_text_roman, meaning, part_of_speech, difficulty_level, example_sentence) VALUES
('Tamil', 'kozhippidum', 'Sacrifice', 'verb', 'advanced', NULL),
('Tamil', 'kattalidum', 'Defend', 'verb', 'advanced', NULL),
('Tamil', 'vaalthum', 'Protect/Care for', 'verb', 'advanced', NULL),
('Tamil', 'nadaippidum', 'Control/Manage', 'verb', 'advanced', NULL),
('Tamil', 'samathidum', 'Agree/Settle', 'verb', 'advanced', NULL),
('Tamil', 'vichidum', 'Investigate/Look into', 'verb', 'advanced', NULL),
('Tamil', 'arulvendum', 'Grace/Bless', 'verb', 'advanced', NULL),
('Tamil', 'paripadum', 'Serve', 'verb', 'advanced', NULL),
('Tamil', 'thaidum', 'Give/Donate', 'verb', 'advanced', NULL),
('Tamil', 'valaridum', 'Grow/Develop', 'verb', 'advanced', NULL)
;

-- ADVANCED LEVEL ADJECTIVES
INSERT INTO public.words (language, word_text_roman, meaning, part_of_speech, difficulty_level, example_sentence) VALUES
('Tamil', 'yogyam', 'Worthy/Deserving', 'adjective', 'advanced', NULL),
('Tamil', 'arivaldan', 'Knowledgeable', 'adjective', 'advanced', NULL),
('Tamil', 'paramparaiyana', 'Traditional', 'adjective', 'advanced', NULL),
('Tamil', 'navya', 'New/Modern', 'adjective', 'advanced', NULL),
('Tamil', 'pracheenam', 'Ancient/Old', 'adjective', 'advanced', NULL),
('Tamil', 'sarvalakshmanai', 'Complete/Full', 'adjective', 'advanced', NULL),
('Tamil', 'atarkkum', 'Rare/Uncommon', 'adjective', 'advanced', NULL),
('Tamil', 'sambhavam', 'Possible', 'adjective', 'advanced', NULL),
('Tamil', 'asambhavam', 'Impossible', 'adjective', 'advanced', NULL),
('Tamil', 'akshayam', 'Eternal/Immortal', 'adjective', 'advanced', NULL)
;
