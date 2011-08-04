namespace :assets do
  desc "Compile stylesheets and javascripts using compass and jammit respectively"
  task :compile do
    system("jammit")
    system("compass compile")
  end
end

