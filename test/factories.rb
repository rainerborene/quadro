FactoryGirl.define do
  factory :user do
    uid "30769834"
    name "Rainer Borene"
    nickname "rainerborene"
    token "30769834-ELWCd6XyR9YXEcxQAcIA8obwjeFP8xAShPx0wfpww"
    secret_token "gCtIF3vo3JoeNIXNNwm6rArh6SBRSUE9ugxODPrI6w"
    profile_image "http://a0.twimg.com/profile_images/1543000133/AIbEiAIAAABECKGq-d2ynMW_sQEiC3ZjYXJkX3Bob3RvKihjZTkzZWM0NTAyM2MxOWE2MzFiOGQ4YjQyNTk0MWYyMzgxYzdkN2I0MAFjnRrSVWZ0RRDFASKj3IdH8Lj0hw_normal.jpeg"
  end

  factory :board do
    title "Untitled"
    association :user
  end

  factory :sticky do
    content "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    top 10
    left 10
    width 200
    height 200
  end
end
