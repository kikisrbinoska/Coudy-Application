package mk.ukim.finki.timski.coudy.service.domain.impl;

import mk.ukim.finki.timski.coudy.model.domain.Habit;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.exceptions.InvalidArgumentsException;
import mk.ukim.finki.timski.coudy.repository.HabitRepository;
import mk.ukim.finki.timski.coudy.service.domain.HabitService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HabitServiceImpl implements HabitService {

    private final HabitRepository habitRepository;


    public HabitServiceImpl(HabitRepository habitRepository) {
        this.habitRepository = habitRepository;
    }

    @Override
    public List<Habit> findAll() {
        return habitRepository.findAll();
    }

    @Override
    public List<Habit> findAllByUser(User user) {
        return habitRepository.findAllByUser(user);
    }

    @Override
    public Habit findById(Long id) {
        return habitRepository.findById(id).orElseThrow(InvalidArgumentsException::new);
    }

    @Override
    public Habit create(Habit habit) {
        Habit newHabit = new Habit();
        return habitRepository.save(newHabit);
    }

    @Override
    public Habit update(Long id, Habit updatedHabit) {
        Habit habit = habitRepository.findById(id).orElseThrow(InvalidArgumentsException::new);
        habit.setName(updatedHabit.getName());
        habit.setCategory(updatedHabit.getCategory());
        habit.setTargetFrequency(updatedHabit.getTargetFrequency());
        habit.setReminderTime(updatedHabit.getReminderTime());
        habit.setStreakCurrent(updatedHabit.getStreakCurrent());
        habit.setStreakLongest(updatedHabit.getStreakLongest());
        habit.setTotalCompletions(updatedHabit.getTotalCompletions());

        return habitRepository.save(habit);
    }

    @Override
    public void detele(Long id) {
        habitRepository.deleteById(id);
    }
}
